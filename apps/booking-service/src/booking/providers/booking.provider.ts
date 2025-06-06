import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room';
import { Booking } from '../entities/booking';
import { HttpService } from '@nestjs/axios';
import { CreateBookingDto } from '../dtos/createBooking.dto';
import { BookingStatus } from '../enums/bookings.enum';
import { firstValueFrom } from 'rxjs';
import { MembershipURL } from '../constants/urls';
import { standardRoomsBlocked } from '../constants/blockedMemberships';
import { platinumRoomsBlocked } from '../constants/blockedMemberships';

@Injectable()
export class BookingProvider {
    constructor(
        @InjectRepository(Room)
        private readonly roomRepository : Repository<Room>,

        @InjectRepository(Booking)
        private readonly bookingRepository : Repository<Booking>,

        private readonly httpService : HttpService
    ){}

    public createBooking = async (createBookingDto : CreateBookingDto) : Promise<Booking> => {
        const {userId , roomId, startTime, endTime} = createBookingDto;
        const parsedStartTime = new Date(startTime);
        const parsedEndTime = new Date(endTime);

        if (parsedEndTime <= parsedStartTime) {
          throw new BadRequestException('End time must be after start time.');
        }

        if(parsedStartTime < new Date()){
            throw new BadRequestException("Booking start time cannot be in the past")
        }

        /// reservation time cnanot be longer than 2 hours
        const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;
        const duration = parsedEndTime.getTime() - parsedStartTime.getTime();
        if(duration > twoHoursInMilliseconds){
            throw new BadRequestException("Booking duration cannot be longer than 2 hours");
        } 

        const room = await this.roomRepository.findOne({where : {id: roomId, isActive : true}});
        if(!room){
            throw new NotFoundException(`Room with ID ${roomId} not found or is not active`);
        }

        /// checking if room is reservated or not
      const conflictingBooking = await this.bookingRepository
      .createQueryBuilder("booking")
      .where("booking.roomId = :roomId", { roomId })
      .andWhere(
        "(booking.startTime < :endTime AND booking.endTime > :startTime)",
        { startTime: parsedStartTime, endTime: parsedEndTime }
      )
      .andWhere("booking.status IN (:...statuses)", { statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] })
      .getOne();

      if(conflictingBooking){
         throw new ConflictException(`Room ${room.name} is already booked!`)
      }

      let activeMembership;
      
      try {
          const response = await firstValueFrom(
             this.httpService.get(`${MembershipURL}/memberships/user/${userId}`)
          );
          activeMembership = response.data;

      } catch (error) {
         if(error.response && error.response.status === 401){
            throw new BadRequestException("User does not have an active membership");
         }
         throw new InternalServerErrorException("Failed to verify user membership");
      }

      if(!activeMembership){
         throw new BadRequestException("User does not have an active membership");
      }

      if(activeMembership.type === 'standard'){
        if(standardRoomsBlocked.includes(room.name)){
            throw new BadRequestException(`Standard members cannot reserve ${room.name}`);
        }
      }

      if(activeMembership.type === 'platinum'){
        if(platinumRoomsBlocked.includes(room.name)){
            throw new BadRequestException(`Platinum members cannot reserve ${room.name}`);
        }
      }

      try {
        const newBooking = this.bookingRepository.create({
        userId,
        roomId,
        membershipId: activeMembership.id,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        status: BookingStatus.PENDING, 
      });

       await this.bookingRepository.save(newBooking);
       return newBooking;

      } catch (error) {
        throw new InternalServerErrorException("Could not create booking due to a database error.")
      }
    }
} 
