import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { CreateMembershipDto } from '../dtos/createMembership.dto';
import { UpdateMembershipDto } from '../dtos/updateMembership.dto';

@Injectable()
export class MembershipProvider {
    constructor(
        @InjectRepository(Membership)
        private readonly membershipRepository : Repository<Membership>
    ){}

    public createMembership = async (createMembershipDto : CreateMembershipDto) : Promise<Membership> => {
        
        const { clientId, type } = createMembershipDto;
        const existingActiveMembership = await this.membershipRepository
            .createQueryBuilder("membership")
            .where("membership.clientId = :clientId", { clientId })
            .andWhere("membership.isActive = :isActive", { isActive: true })
            .andWhere("membership.endDate > :now", { now: new Date() })
            .getOne();

        if (existingActiveMembership) {
            throw new ConflictException(`Client with ID ${clientId}.`);
        }

        const startDate = new Date();
        const endDate = new Date();

        endDate.setDate(startDate.getDate() + 30);
      
        try {
            const newMembership = this.membershipRepository.create({
                clientId,
                type,
                startDate,
                endDate, 
                isActive: true, 
            });

            await this.membershipRepository.save(newMembership);
            return newMembership;

        } catch (error) {
             console.error("Error creating membership:", error);
             throw new InternalServerErrorException("Could not create membership");
        }
    }

    public getActiveMembershipByUserId = async (userId: string): Promise<Membership | null> => {
        const membership = await this.membershipRepository.findOne({
        where: { clientId: userId, isActive: true },
        });

        if (membership && membership.endDate < new Date()) {
        membership.isActive = false;
        await this.membershipRepository.save(membership);
        return null;
        }

        return membership;
    };

    
}
