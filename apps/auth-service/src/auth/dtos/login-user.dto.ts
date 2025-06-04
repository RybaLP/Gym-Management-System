import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginUserDto{
    
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(100, { message: 'Email cannot be longer than 100 characters' }) 
    email: string; 
    
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(5, { message: 'Password must be at least 5 characters long' })
    @MaxLength(50, { message: 'Password cannot be longer than 50 characters' })
    password : string;
}

