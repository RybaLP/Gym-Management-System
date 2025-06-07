import { Body, ConflictException, Controller, Delete, Get, Injectable, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MembershipService } from './providers/membership.service.service';
import { CreateMembershipDto } from './dtos/createMembership.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService : MembershipService){}

   @UseGuards(AuthGuard('jwt'))
   @Get('user/:userId')
    public async getActiveMembershipByUserId(@Param('userId') userId: string) {
        try {
        const membership = await this.membershipService.getActiveMembershipByUserId(userId);
        if (!membership) {
            throw new NotFoundException(`No active membership found for user with ID ${userId}.`);
        }
        return membership;
        } catch (error) {
        if (error instanceof NotFoundException) {
            throw error; 
        }
        throw new InternalServerErrorException('Failed to retrieve membership due to an unexpected error.');
        }
    }


  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async createMembership(@Body() createMembershipDto: CreateMembershipDto) { 
    try {
      return await this.membershipService.createMembership(createMembershipDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; 
      }
      throw new InternalServerErrorException('Failed to create membership ');
    }
  }
}
