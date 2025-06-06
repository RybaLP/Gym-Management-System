import { Module } from '@nestjs/common';
import { BookingServiceService } from './providers/booking.service.service';
import { BookingProvider } from './providers/booking.provider';
import { BookingController } from './booking.controller';
import { Room } from './entities/room';
import { Booking } from './entities/booking';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports : [TypeOrmModule.forFeature([Booking,Room]), BookingModule, HttpModule],
  providers: [BookingServiceService, BookingProvider],
  controllers: [BookingController]
})
export class BookingModule {}
