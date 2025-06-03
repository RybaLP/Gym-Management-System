import { PartialType } from "@nestjs/mapped-types";
import { CreateMembershipDto } from "./createMembership.dto";

export class UpdateMebershipDto extends PartialType(CreateMembershipDto){}