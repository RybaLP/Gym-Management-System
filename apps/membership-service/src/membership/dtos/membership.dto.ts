import { IsBoolean, IsDecimal, IsInt, IsNotEmpty,IsOptional,IsString, MaxLength,Min, MinLength} from "class-validator";

export class CreateMembershipDto { 
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    name : string

    @IsString()
    @IsOptional()
    description? : string

    @IsDecimal({decimal_digits : '0.2'})
    @Min(0)
    @IsNotEmpty()
    price : number

    @IsInt()
    @Min(0)
    @IsNotEmpty()
    durationDays : number
}