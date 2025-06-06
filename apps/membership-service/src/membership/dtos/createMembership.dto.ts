import { IsBoolean, IsDateString, IsDecimal, IsEnum, IsInt, IsNotEmpty,IsOptional,IsString, IsUUID, MaxLength,Min, MinLength} from "class-validator";
import { MembershipType } from "../enums/membership.enum";

export class CreateMembershipDto { 
    @IsUUID()
    clientId : string; 

    @IsEnum(MembershipType)
    type : MembershipType;
}