import { Test, TestingModule } from '@nestjs/testing';
import { MembershipProvider } from './membership.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { CreateMembershipDto } from '../dtos/createMembership.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { MembershipType } from '../enums/membership.enum';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

describe('MembershipProvider', () => {
  let provider: MembershipProvider;
  let membershipRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

  const mockDate = new Date('2025-01-15T10:00:00.000Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    membershipRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    mockQueryBuilder.where.mockClear();
    mockQueryBuilder.andWhere.mockClear();
    mockQueryBuilder.getOne.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipProvider,
        {
          provide: getRepositoryToken(Membership),
          useValue: membershipRepository,
        },
      ],
    }).compile();

    provider = module.get<MembershipProvider>(MembershipProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createMembership', () => {
    const createMembershipDto: CreateMembershipDto = {
      clientId: 'client-id-1',
      type: MembershipType.STANDARD, 
    };

    it('should successfully create and return a new membership', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null); 

      const expectedNewMembership: Membership = {
        id: 'new-membership-id',
        clientId: createMembershipDto.clientId,
        type: createMembershipDto.type,
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000), 
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      membershipRepository.create.mockReturnValue(expectedNewMembership);
      membershipRepository.save.mockResolvedValue(expectedNewMembership);

      const result = await provider.createMembership(createMembershipDto);

      expect(membershipRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('membership.clientId = :clientId', { clientId: createMembershipDto.clientId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('membership.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('membership.endDate > :now', { now: mockDate });
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);

      expect(membershipRepository.create).toHaveBeenCalledTimes(1);
      expect(membershipRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: createMembershipDto.clientId,
          type: createMembershipDto.type,
          startDate: mockDate,
          endDate: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        }),
      );
      expect(membershipRepository.save).toHaveBeenCalledTimes(1);
      expect(membershipRepository.save).toHaveBeenCalledWith(expectedNewMembership);
      expect(result).toEqual(expectedNewMembership);
    });

    it('should throw ConflictException if an active membership already exists', async () => {
      const existingMembership: Membership = {
        id: 'existing-id',
        clientId: createMembershipDto.clientId,
        type: MembershipType.PLATINUM, // Dostosowano do Twoich typów
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-01'), // Data w przyszłości względem mockDate
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQueryBuilder.getOne.mockResolvedValue(existingMembership);

      // Poprawka: Jedno wywołanie .rejects.toThrow()
      await expect(provider.createMembership(createMembershipDto)).rejects.toThrow(
        new ConflictException(`Client with ID ${createMembershipDto.clientId}.`),
      );

      expect(membershipRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('membership.clientId = :clientId', { clientId: createMembershipDto.clientId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('membership.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('membership.endDate > :now', { now: mockDate });
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.create).not.toHaveBeenCalled();
      expect(membershipRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if saving the membership fails', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      membershipRepository.create.mockReturnValue({ ...createMembershipDto, id: 'temp' });
      membershipRepository.save.mockRejectedValue(new Error('Database error')); // Błąd podczas zapisu

      // Poprawka: Jedno wywołanie .rejects.toThrow()
      await expect(provider.createMembership(createMembershipDto)).rejects.toThrow(
        new InternalServerErrorException('Could not create membership'),
      );

      expect(membershipRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('membership.clientId = :clientId', { clientId: createMembershipDto.clientId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('membership.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('membership.endDate > :now', { now: mockDate });
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.create).toHaveBeenCalledTimes(1);
      expect(membershipRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActiveMembershipByUserId', () => {
    const userId = 'test-user-id';

    it('should return the active and valid membership', async () => {
      const activeMembership: Membership = {
        id: 'mem-1',
        clientId: userId,
        type: MembershipType.DIAMOND, // Dostosowano do Twoich typów
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-10'), // Data w przyszłości względem mockDate (2025-01-15)
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      membershipRepository.findOne.mockResolvedValue(activeMembership);

      const result = await provider.getActiveMembershipByUserId(userId);

      expect(membershipRepository.findOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.findOne).toHaveBeenCalledWith({
        where: { clientId: userId, isActive: true },
      });
      expect(membershipRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(activeMembership);
    });

    it('should return null if no membership is found', async () => {
      membershipRepository.findOne.mockResolvedValue(null);

      const result = await provider.getActiveMembershipByUserId(userId);

      expect(membershipRepository.findOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.findOne).toHaveBeenCalledWith({
        where: { clientId: userId, isActive: true },
      });
      expect(membershipRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should deactivate and return null if active membership has expired', async () => {
      const expiredMembership: Membership = {
        id: 'mem-expired',
        clientId: userId,
        type: MembershipType.STANDARD, // Dostosowano do Twoich typów
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-01-10'), // Data w przeszłości względem mockDate (2025-01-15)
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      membershipRepository.findOne.mockResolvedValue(expiredMembership);
      membershipRepository.save.mockResolvedValue({ ...expiredMembership, isActive: false });

      const result = await provider.getActiveMembershipByUserId(userId);

      expect(membershipRepository.findOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.findOne).toHaveBeenCalledWith({
        where: { clientId: userId, isActive: true },
      });
      expect(membershipRepository.save).toHaveBeenCalledTimes(1);
      expect(membershipRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ ...expiredMembership, isActive: false }),
      );
      expect(result).toBeNull();
    });

    it('should rethrow error if findOne fails', async () => {
      const expectedError = new Error('Database find error');
      membershipRepository.findOne.mockRejectedValue(expectedError);

      await expect(provider.getActiveMembershipByUserId(userId)).rejects.toThrow(expectedError);
      expect(membershipRepository.findOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.save).not.toHaveBeenCalled();
    });

    it('should rethrow error if save after deactivation fails', async () => {
      const expiredMembership: Membership = {
        id: 'mem-expired',
        clientId: userId,
        type: MembershipType.STANDARD, // Dostosowano do Twoich typów
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-01-10'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedError = new Error('Database save error after deactivation');
      membershipRepository.findOne.mockResolvedValue(expiredMembership);
      membershipRepository.save.mockRejectedValue(expectedError);

      await expect(provider.getActiveMembershipByUserId(userId)).rejects.toThrow(expectedError);
      expect(membershipRepository.findOne).toHaveBeenCalledTimes(1);
      expect(membershipRepository.save).toHaveBeenCalledTimes(1);
      expect(membershipRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ ...expiredMembership, isActive: false }),
      );
    });
  });
});