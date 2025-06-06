import { Body, Controller, Post } from '@nestjs/common';
import { CreateBookingDto } from './dtos/createBooking.dto';
import { BookingServiceService } from './providers/booking.service.service';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService : BookingServiceService){}

    @Post()
    public createBooking(@Body() createBookingDto : CreateBookingDto){
        return this.bookingService.createBooking(createBookingDto);
    }
}
