import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipService } from './providers/membership.service';
import { CreateMembershipDto } from './dtos/createMembership.dto';
import { Membership } from './entities/membership.entity';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MembershipType } from './enums/membership.enum';

describe('MembershipController', () => {
  let controller: MembershipController;
  let membershipService: {
    createMembership: jest.Mock;
    getActiveMembershipByUserId: jest.Mock;
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    membershipService = {
      createMembership: jest.fn(),
      getActiveMembershipByUserId: jest.fn(),
    };
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipController],
      providers: [
        {
          provide: MembershipService,
          useValue: membershipService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<MembershipController>(MembershipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getActiveMembershipByUserId', () => {
    const userId = 'test-user-id';

    it('should return membership if found', async () => {
      const mockMembership: Membership = {
        id: 'mem1',
        clientId: userId,
        type: MembershipType.STANDARD,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      membershipService.getActiveMembershipByUserId.mockResolvedValue(mockMembership);

      const result = await controller.getActiveMembershipByUserId(userId);

      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockMembership);
    });

    it('should throw NotFoundException if no membership is found', async () => {
      membershipService.getActiveMembershipByUserId.mockResolvedValue(null);

      await expect(controller.getActiveMembershipByUserId(userId)).rejects.toThrow(
        new NotFoundException(`No active membership found for user with ID ${userId}.`),
      );

      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
    });

    it('should rethrow NotFoundException if service throws it', async () => {
      const notFoundError = new NotFoundException('Some specific not found error from service');
      membershipService.getActiveMembershipByUserId.mockRejectedValue(notFoundError);

      await expect(controller.getActiveMembershipByUserId(userId)).rejects.toThrow(notFoundError);
      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw InternalServerErrorException for other errors from service', async () => {
      const genericError = new Error('Database connection failed');
      membershipService.getActiveMembershipByUserId.mockRejectedValue(genericError);

      await expect(controller.getActiveMembershipByUserId(userId)).rejects.toThrow(
        new InternalServerErrorException('Failed to retrieve membership due to an unexpected error.'),
      );

      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipService.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('createMembership', () => {
    const createMembershipDto: CreateMembershipDto = {
      clientId: 'new-client',
      type: MembershipType.PLATINUM,
    };

    it('should create membership successfully', async () => {
      const mockCreatedMembership: Membership = {
        id: 'new-mem-id-1',
        clientId: createMembershipDto.clientId,
        type: createMembershipDto.type,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      membershipService.createMembership.mockResolvedValue(mockCreatedMembership);

      const result = await controller.createMembership(createMembershipDto);

      expect(membershipService.createMembership).toHaveBeenCalledTimes(1);
      expect(membershipService.createMembership).toHaveBeenCalledWith(createMembershipDto);
      expect(result).toEqual(mockCreatedMembership);
    });

    it('should rethrow ConflictException if service throws it', async () => {
      const conflictError = new ConflictException('Client already has an active membership.');
      membershipService.createMembership.mockRejectedValue(conflictError);

      await expect(controller.createMembership(createMembershipDto)).rejects.toThrow(conflictError);
      expect(membershipService.createMembership).toHaveBeenCalledTimes(1);
      expect(membershipService.createMembership).toHaveBeenCalledWith(createMembershipDto);
    });

    it('should throw InternalServerErrorException for other errors from service', async () => {
      const genericError = new Error('Database write error');
      membershipService.createMembership.mockRejectedValue(genericError);

      await expect(controller.createMembership(createMembershipDto)).rejects.toThrow(
        new InternalServerErrorException('Failed to create membership '), 
      );

      expect(membershipService.createMembership).toHaveBeenCalledTimes(1);
      expect(membershipService.createMembership).toHaveBeenCalledWith(createMembershipDto);
    });
  });
});