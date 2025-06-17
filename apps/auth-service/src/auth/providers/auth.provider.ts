import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { UserRole } from '../enums/user-role.enum';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { registerUrl } from '../constants/urls';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { map } from 'rxjs';
import { LoginUserDto } from '../dtos/login-user.dto';
import { HashingProvider } from './hashing.provider';
import { GenerateToken } from './generate-token';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AuthProvider {

    private readonly logger = new Logger(AuthProvider.name);

    constructor(
        @InjectRepository(AuthUser)
        private readonly authUserRepository : Repository<AuthUser>,

        private readonly httpService : HttpService,

        private readonly hashingProvider : HashingProvider,

        private readonly generateTokenProvider : GenerateToken

    ){}

    public registerUser = async (registerUserDto : RegisterUserDto) => {
        const { email, password, firstName, lastName, phone } = registerUserDto;
        
        const existingUser = await this.authUserRepository.findOne({ where: { email } });
        
        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        let newUser : AuthUser | null = null;

        try {
            const hashedPassword = await this.hashingProvider.hashPassword(password);
            newUser = this.authUserRepository.create({
                email,
                password : hashedPassword,
                role : UserRole.CLIENT,
                isActive : true
            })
            await this.authUserRepository.save(newUser);

            await lastValueFrom(
                this.httpService.post(registerUrl, {
                    id: newUser.id,
                    email: newUser.email,
                    firstName,
                    lastName,
                    phone,
             }).pipe(
                map((response) => response.data),
                catchError((error: AxiosError) => {
                    console.error(error.response?.data || error.message);
                    throw new InternalServerErrorException("Failed to create profile!");
                })
        ));

        const accessToken = await this.generateTokenProvider.generateToken(newUser);
        
        if(!accessToken){
            throw new Error("Could not generate access token ! ");
        }

        return {accessToken, user : {id : newUser.id, email : newUser.email, role : newUser.role}}
            
        } catch (error) {
            if (newUser && newUser.id) {
                try {
                    await this.authUserRepository.delete(newUser.id);
                } catch (compensationError) {
                    throw new Error(`Failed to compensate AuthUser ${newUser.id}`);
                }
            }

            if (error instanceof BadRequestException || error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
                throw error; 
            }

            if (error.message === 'Token generation failed!') {
                throw new InternalServerErrorException('Could not generate access token ! ');
            }

            this.logger.error(`An unexpected error occurred during registration: ${error.message}`);

            throw new InternalServerErrorException('Registration failed due to an unexpected error. Please try again.');
        }
    }

    public signIn = async (loginUserDto : LoginUserDto) => {
        const {email , password} = loginUserDto;
        let existingUser : AuthUser | null;

        try {
            existingUser = await this.authUserRepository.findOne({
                where : {
                    email
                },
                select : ['id', 'email', 'password', 'role', 'isActive']
            });
        } catch (error) {
            throw new InternalServerErrorException("Could not fetch the user. Please try again later.");
        }
        if(!existingUser){
            throw new UnauthorizedException("Invalid credentials");
        }

        if(!existingUser.isActive){ 
            throw new UnauthorizedException("Account is inactive. Please contact support")
        }

        try {
            const matchingPassword = await this.hashingProvider.comparePassword(password, existingUser.password)
             if(!matchingPassword){
                throw new UnauthorizedException("Invalid credentials");
             }
        } catch (error) {
            throw new UnauthorizedException("Invalid credentials"); 
        }

        const accessToken = await this.generateTokenProvider.generateToken(existingUser);

        return {accessToken : accessToken};
    }
}