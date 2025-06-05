import { Body, Controller } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { Post } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService){}

    @Post('/register')
    public registerUser(@Body() registerUserDto : RegisterUserDto){
        return this.authService.registerUser(registerUserDto);
    }

    @Post('/login')
    public loginUser(@Body() loginUserDto : LoginUserDto){
        return this.authService.signUser(loginUserDto);
    }

}
