import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateClientDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(15)
    login : string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
    password : string; 

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    firstName : string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    lastName : string;

    @IsEmail()
    @IsNotEmpty()
    email : string;

    @IsOptional()
    @IsString()
    phone? : string

}