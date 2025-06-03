import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { CreateMembershipDto } from '../dtos/membership.dto';
import { UpdateMebershipDto } from '../dtos/updateMembership.dto';

@Injectable()
export class MembershipProvider {
    constructor(
        @InjectRepository(Membership)
        private readonly membershipRepository : Repository<Membership>
    ){}

    public createMembership = async (createMembershipDto : CreateMembershipDto) : Promise<Membership> => {
        const exisintMembership = await this.membershipRepository.findOne({
            where : {
                name : createMembershipDto.name
            }
        })

        if(exisintMembership) {
            throw new Error(`Membership with name ${createMembershipDto.name} already exists!`);
        }

        try {
            const newMembership = await this.membershipRepository.create({...createMembershipDto});
            await this.membershipRepository.save(newMembership);
            return newMembership
        } catch (error) {
            throw new Error("Could not create membership")
        }
    }

    public findAllMemberships = async () : Promise<Membership[]> => {
        try {
            return await this.membershipRepository.find({
                where : {isActive : true}
            });
        } catch (error) {
            throw new Error("Could not find any memberships!");
        }
    }

    public findMembershipById = async (id : number) : Promise<Membership> => {
        const membership = await this.membershipRepository.findOneBy([
            {id},
            {isActive : true}
        ])

        if(!membership){
            throw new Error("");
        }

        try {
            return membership;
        } catch (error) {
            throw new Error(`Could not retrun membership with id : ${id}`)
        }
    }

    public softDeleteMembership = async (id : number) : Promise<void> => {
        const membership = await this.membershipRepository.findOneBy({id})
        
        if(!membership){
            throw new Error(`Could not find member ship with ${id} id`);
        }

        if(!membership.isActive){
            throw new Error(`Membership with ID ${id} is already inactive`);
        }

        try {
            await this.membershipRepository.update(id, {isActive : false})
        } catch (error) {
            throw new Error("Cout not set membership to inactive!");
        }
    }

    public updateMembership = async (id : number , updateMembershipDto : UpdateMebershipDto) : Promise<Membership | null> => {
        const membership = await this.membershipRepository.findOneBy([{id}, {
            isActive : true
        }])

        if(!membership){
            throw new Error(`Membership with ID ${id} does not exist or is not active.`);
        }

        /// prevents from duplicate of the same record
        if (updateMembershipDto.name && updateMembershipDto.name !== membership.name) {
            const existingWithName = await this.membershipRepository.findOne({
                where: { name: updateMembershipDto.name, isActive: true },
            });
            if (existingWithName) {
                throw new Error(`Membership with name "${updateMembershipDto.name}" already exists.`);
            }
        }

        try {
            const updateResult = await this.membershipRepository.update(id, updateMembershipDto);
            
            if(updateResult.affected === 0){
                return membership;
            }

            const updatedMembership = await this.membershipRepository.findOneBy({id});
            return updatedMembership;

        } catch (error) {
            throw new Error('Could not update membership!');
        }
    }
}
