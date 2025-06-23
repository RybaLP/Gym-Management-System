import { Test, TestingModule } from '@nestjs/testing';
import { BookingProvider } from './booking.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room';
import { Booking } from '../entities/booking';
import { HttpService } from '@nestjs/axios';
import { CreateBookingDto } from '../dtos/createBooking.dto';
import { BookingStatus } from '../enums/bookings.enum';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

import { RoomName } from '../enums/room.enum';

const mockMembershipURL = 'http://localhost:3000';
const mockStandardRoomsBlocked = [RoomName.STREAM_SAUNA, RoomName.TRAINING_ROOM_1];
const mockPlatinumRoomsBlocked = [RoomName.DEFAULT_SAUNA];

const mockBookingQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

describe('BookingProvider', () => {
  let provider: BookingProvider;
  let roomRepository: { findOne: jest.Mock };
  let bookingRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let httpService: { get: jest.Mock };

  const mockCurrentTime = new Date('2025-01-15T10:00:00.000Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    roomRepository = {
      findOne: jest.fn(),
    };
    bookingRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockBookingQueryBuilder),
      create: jest.fn(),
      save: jest.fn(),
    };
    httpService = {
      get: jest.fn(),
    };

    jest.clearAllMocks();
    mockBookingQueryBuilder.where.mockClear();
    mockBookingQueryBuilder.andWhere.mockClear();
    mockBookingQueryBuilder.getOne.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingProvider,
        { provide: getRepositoryToken(Room), useValue: roomRepository },
        { provide: getRepositoryToken(Booking), useValue: bookingRepository },
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    provider = module.get<BookingProvider>(BookingProvider);

    Object.defineProperty(provider, 'standardRoomsBlocked', {
      get: () => mockStandardRoomsBlocked,
      configurable: true,
    });
    Object.defineProperty(provider, 'platinumRoomsBlocked', {
      get: () => mockPlatinumRoomsBlocked,
      configurable: true,
    });
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createBooking', () => {
    const commonCreateBookingDto: CreateBookingDto = {
      userId: 'user-1',
      roomId: 'room-1',
      startTime: new Date(mockCurrentTime.getTime() + 60 * 60 * 1000).toISOString(),
      endTime: new Date(mockCurrentTime.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    };

    const mockRoom: Room = {
      id: 'room-1',
      name: RoomName.TRAINING_ROOM_3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMembership = { id: 'mem-1', type: 'gold', userId: 'user-1' };

    const setupSuccessfulMocks = (room: Room = mockRoom, membership = mockMembership) => {
      roomRepository.findOne.mockResolvedValue(room);
      mockBookingQueryBuilder.getOne.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: membership, status: 200 } as AxiosResponse));
      bookingRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 'new-booking-id',
        status: BookingStatus.PENDING,
      }));
      bookingRepository.save.mockImplementation((booking) => Promise.resolve(booking));
    };

    it('should throw BadRequestException if end time is not after start time', async () => {
      const dto: CreateBookingDto = {
        ...commonCreateBookingDto,
        startTime: new Date(mockCurrentTime.getTime() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(mockCurrentTime.getTime() + 60 * 60 * 1000).toISOString(),
      };
      await expect(provider.createBooking(dto)).rejects.toThrow(
        new BadRequestException('End time must be after start time.'),
      );
      expect(roomRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if start time is in the past', async () => {
      const dto: CreateBookingDto = {
        ...commonCreateBookingDto,
        startTime: new Date(mockCurrentTime.getTime() - 60 * 60 * 1000).toISOString(),
      };
      await expect(provider.createBooking(dto)).rejects.toThrow(
        new BadRequestException('Booking start time cannot be in the past'),
      );
      expect(roomRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking duration is longer than 2 hours', async () => {
      const dto: CreateBookingDto = {
        ...commonCreateBookingDto,
        startTime: new Date(mockCurrentTime.getTime() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(mockCurrentTime.getTime() + 3 * 60 * 60 * 1000 + 1).toISOString(),
      };
      await expect(provider.createBooking(dto)).rejects.toThrow(
        new BadRequestException('Booking duration cannot be longer than 2 hours.'),
      );
      expect(roomRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if room is not found or not active', async () => {
      roomRepository.findOne.mockResolvedValue(null);
      await expect(provider.createBooking(commonCreateBookingDto)).rejects.toThrow(
        new NotFoundException(`Room with ID ${commonCreateBookingDto.roomId} not found or is not active`),
      );
    });

    it('should throw ConflictException if room is already booked', async () => {
      setupSuccessfulMocks(mockRoom);
      mockBookingQueryBuilder.getOne.mockResolvedValue({ id: 'conflict' } as Booking);

      await expect(provider.createBooking(commonCreateBookingDto)).rejects.toThrow(
        new ConflictException(`Room ${mockRoom.name} is already booked!`),
      );
    });

    it('should throw BadRequestException if user does not have an active membership (404)', async () => {
      setupSuccessfulMocks(mockRoom);
      httpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 404, data: 'Not Found' } })),
      );
      await expect(provider.createBooking(commonCreateBookingDto)).rejects.toThrow(
        new BadRequestException('User does not have an active membership'),
      );
    });

    it('should throw BadRequestException if membership service returns null data', async () => {
      setupSuccessfulMocks(mockRoom);
      httpService.get.mockReturnValue(of({ data: null, status: 200 } as AxiosResponse));
      await expect(provider.createBooking(commonCreateBookingDto)).rejects.toThrow(
        new BadRequestException('User does not have an active membership'),
      );
    });

    it('should throw InternalServerErrorException if membership service fails with another error', async () => {
      setupSuccessfulMocks(mockRoom);
      httpService.get.mockReturnValue(throwError(() => new Error('Something bad')));
      await expect(provider.createBooking(commonCreateBookingDto)).rejects.toThrow(
        new InternalServerErrorException('Failed to verify user membership'),
      );
    });

    it('should throw BadRequestException if standard member tries to book a blocked room', async () => {
      const roomBlockedForStandard: Room = { ...mockRoom, name: mockStandardRoomsBlocked[0] };
      const standardMembership = { id: 'mem-std', type: 'standard', userId: 'user-1' };
      setupSuccessfulMocks(roomBlockedForStandard, standardMembership);

      const dto: CreateBookingDto = { ...commonCreateBookingDto, roomId: roomBlockedForStandard.id };

      await expect(provider.createBooking(dto)).rejects.toThrow(
        new BadRequestException(`Standard members cannot reserve ${roomBlockedForStandard.name}`),
      );
    });

    it('should throw BadRequestException if platinum member tries to book a blocked room', async () => {
      const roomBlockedForPlatinum: Room = { ...mockRoom, name: mockPlatinumRoomsBlocked[0] };
      const platinumMembership = { id: 'mem-3', type: 'platinum', userId: 'user-1' };
      setupSuccessfulMocks(roomBlockedForPlatinum, platinumMembership);

      const dto: CreateBookingDto = { ...commonCreateBookingDto, roomId: roomBlockedForPlatinum.id };

      await expect(provider.createBooking(dto)).rejects.toThrow(
        new BadRequestException(`Platinum members cannot reserve ${roomBlockedForPlatinum.name}`),
      );
    });

    it('should create booking if membership type allows booking of the room', async () => {
      const allowedRoom: Room = { ...mockRoom, name: RoomName.TRAINING_ROOM_3 };
      const standardMembership = { id: 'mem-2', type: 'standard', userId: 'user-1' };
      setupSuccessfulMocks(allowedRoom, standardMembership);

      const dto: CreateBookingDto = { ...commonCreateBookingDto, roomId: allowedRoom.id };
      const result = await provider.createBooking(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.userId).toBe(dto.userId);
    });

    it('should successfully create and return a new booking for a valid scenario', async () => {
      setupSuccessfulMocks();
      const result = await provider.createBooking(commonCreateBookingDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'new-booking-id',
          userId: commonCreateBookingDto.userId,
          roomId: commonCreateBookingDto.roomId,
        }),
      );
    });

    it('should throw InternalServerErrorException if saving the booking fails', async () => {
      setupSuccessfulMocks();
      bookingRepository.save.mockRejectedValue(new Error('fail'));
      await expect(provider.createBooking(commonCreateBookingDto)).rejects.toThrow(
        new InternalServerErrorException('Could not create booking due to a database error.'),
      );
    });
  });
});
