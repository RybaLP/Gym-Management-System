import { PartialType } from "@nestjs/mapped-types";
import { CreateClientDto } from "./create-client.dto";

//  this class extends the CreateClientDto, but uses PartialType to make all properties optional.
//  this means that when updating a client, only the fields that need to be changed
//  have to be provided.

export class UpdateClientDto extends PartialType(CreateClientDto){}