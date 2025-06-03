import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from '../dtos/membership.dto';
import { MembershipProvider } from './membership.provider';
import { UpdateMembershipDto } from '../dtos/updateMembership.dto';

@Injectable()
export class MembershipService {
    constructor(
        private readonly membershipProvider : MembershipProvider
    ){}

    public findAllMemberships = async () => {
        return await this.membershipProvider.findAllMemberships();
    }

    public findMembershipById = async (id : number) => {
        return await this.membershipProvider.findMembershipById(id)
    }

    public createMembership = async (createMembershipDto : CreateMembershipDto) => {
        return await this.membershipProvider.createMembership(createMembershipDto);
    }

    public updateMembership = async (id : number , updateMembershipDto : UpdateMembershipDto) => {
        return await this.membershipProvider.updateMembership(id , updateMembershipDto)
    }

    public softDeleteMembership = async (id : number) => {
        return await this.membershipProvider.softDeleteMembership(id)
    }

    public deleteMembership = async (id : number ) => {
        return await this.membershipProvider.deleteMembership(id);
    }
}
