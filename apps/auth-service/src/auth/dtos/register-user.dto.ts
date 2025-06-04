import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEmail } from "class-validator";
import { UserRole } from "../enums/user-role.enum";

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(5, { message: 'Password must be at least 5 characters long' })
    @MaxLength(50, { message: 'Password cannot be longer than 50 characters' })
    password: string;

    @IsNotEmpty({ message: 'First name cannot be empty' })
    @IsString({ message: 'First name must be a string' })
    @MaxLength(30, { message: 'First name cannot be longer than 30 characters' })
    firstName: string;

    @IsNotEmpty({ message: 'Last name cannot be empty' })
    @IsString({ message: 'Last name must be a string' })
    @MaxLength(30, { message: 'Last name cannot be longer than 30 characters' })
    lastName: string;

    @IsOptional() 
    @IsString({ message: 'Phone must be a string' })
    @MaxLength(20, { message: 'Phone number cannot be longer than 20 characters' })
    phone?: string;

    @IsOptional()
    role? : UserRole
}