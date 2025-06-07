import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateBookingDto } from './dtos/createBooking.dto';
import { BookingService } from './providers/booking.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService : BookingService){}


    @Post()
    @UseGuards(AuthGuard('jwt'))
    public createBooking(@Body() createBookingDto : CreateBookingDto){
        return this.bookingService.createBooking(createBookingDto);
    }
}
