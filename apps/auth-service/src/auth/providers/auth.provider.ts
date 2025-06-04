import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { UserRole } from '../enums/user-role.enum';
import { LoginUserDto } from '../dtos/login-user.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { registerUrl } from '../constants/urls';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { map } from 'rxjs';


@Injectable()
export class AuthProvider {
    constructor(
        @InjectRepository(AuthUser)
        private readonly authUserRepository : Repository<AuthUser>
        ,private readonly httpService : HttpService

    ){}

    public registerUser = async (registerUserDto : RegisterUserDto) => {
        const { email, password, firstName, lastName, phone } = registerUserDto;
        
        const existingUser = await this.authUserRepository.findOne({ where: { email } });
        
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        let newUser : AuthUser

        try {
            newUser = this.authUserRepository.create({
                email,
                password,
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
                throw new Error("Failed to create profile!");
            })
        ));
            
            
        } catch (error) {
            throw new Error("")
        }

        

    }
}
