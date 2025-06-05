import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from '../dtos/createMembership.dto';
import { MembershipProvider } from './membership.provider';
import { UpdateMembershipDto } from '../dtos/updateMembership.dto';

@Injectable()
export class MembershipService {
    constructor(
        private readonly membershipProvider : MembershipProvider
    ){}

    public createMembership(createMembershipDto : CreateMembershipDto){
        return this.membershipProvider.createMembership(createMembershipDto);
    }

    public getActiveMembershipByUserId(id : string){
        return this.membershipProvider.getActiveMembershipByUserId(id)   
    }
   
}
