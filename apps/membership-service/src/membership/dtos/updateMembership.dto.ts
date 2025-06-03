import { PartialType } from "@nestjs/mapped-types";
import { CreateMembershipDto } from "./membership.dto";

export class UpdateMembershipDto extends PartialType(CreateMembershipDto){}