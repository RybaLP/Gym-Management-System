import { Injectable } from '@nestjs/common';
import { BookingProvider } from './booking.provider';
import { CreateBookingDto } from '../dtos/createBooking.dto';

@Injectable()
export class BookingServiceService {
    constructor(private readonly bookingProvider : BookingProvider){}

    public createBooking = async (createBooklngDto : CreateBookingDto) => {
        return await this.bookingProvider.createBooking(createBooklngDto);
    }

}
