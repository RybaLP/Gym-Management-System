import { Injectable } from '@nestjs/common';
import { AuthProvider } from './auth.provider';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';

@Injectable()
export class AuthService {
    constructor(private readonly authProvider : AuthProvider){}

    public registerUser = (registerUserDto : RegisterUserDto) => {
        return this.authProvider.registerUser(registerUserDto);
    }   

    public signUser = (loginUserDto : LoginUserDto) => {
        return this.authProvider.signIn(loginUserDto);
    }
}
