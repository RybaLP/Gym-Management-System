import { Controller, Delete, Injectable, Param, ParseIntPipe } from '@nestjs/common';
import { MembershipService } from './providers/membership.service.service';
import { Post, Patch, Get } from '@nestjs/common';
import { CreateMembershipDto } from './dtos/membership.dto';
import { Body } from '@nestjs/common';
import { UpdateMembershipDto } from './dtos/updateMembership.dto';

@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService : MembershipService){}
    
    @Get()
    public async findAllMemberships(){
        return await this.membershipService.findAllMemberships()
    }

    @Get('/:id')
    public async findMembershipById(@Param('id', ParseIntPipe) id : number){
        return await this.membershipService.findMembershipById(id)
    }

    @Post()
    public async createMembership(@Body() createMembershipDto : CreateMembershipDto){
        return await this.membershipService.createMembership(createMembershipDto);
    }

    @Patch('/:id')
    public async updateMembership(@Param('id', ParseIntPipe) id : number, updateMembershipDto : UpdateMembershipDto){
        return await this.membershipService.updateMembership(id , updateMembershipDto)
    }

    // softdelete changes isActive field to false and does not delete record in database
    @Patch('/softdelete/:id')
    public async softDeleteMembership(@Param('id', ParseIntPipe) id : number){
        return await this.membershipService.softDeleteMembership(id);
    }

    /// deletes record pernamently
    @Delete('/:id')
    public async deleteMembership(@Param('id', ParseIntPipe) id : number){
        return await this.membershipService.deleteMembership(id)
    }

}
