import { IsDateString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateBookingDto {
    @IsUUID('4', {message : "userId must be a valid UUID"})
    @IsNotEmpty({message : "userId cannot be empty"})
    userId : string; 

    @IsUUID('4', {message : "roomId must be a valid UUId"})
    @IsNotEmpty({message : "roomId cannot be empty"})
    roomId : string;

    @IsNotEmpty({message : "startTime cannot be empty"})
    @IsNotEmpty({message : "roomId cannot be empty"})
    startTime : string;

    @IsNotEmpty({ message: 'endTime cannot be empty' })
    @IsDateString({}, { message: 'endTime must be a valid ISO 8601 date string' })
    endTime: string;
}