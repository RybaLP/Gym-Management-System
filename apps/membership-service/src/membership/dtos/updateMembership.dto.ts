import { PartialType } from "@nestjs/mapped-types";
import { CreateMembershipDto } from "./createMembership.dto";

export class UpdateMembershipDto extends PartialType(CreateMembershipDto){}