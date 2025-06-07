import { Module } from '@nestjs/common';
import { BookingService } from './providers/booking.service';
import { BookingProvider } from './providers/booking.provider';
import { BookingController } from './booking.controller';
import { Room } from './entities/room';
import { Booking } from './entities/booking';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RoomSeeder } from './seeders/room.seder';

@Module({
  imports : [TypeOrmModule.forFeature([Booking,Room]), BookingModule, HttpModule],
  providers: [BookingService, BookingProvider, RoomSeeder],
  controllers: [BookingController]
})
export class BookingModule {}
