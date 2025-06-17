import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import { MembershipProvider } from './membership.provider'; 
import { CreateMembershipDto } from '../dtos/createMembership.dto'; 
import { Membership } from '../entities/membership.entity'; 
import { MembershipType } from '../enums/membership.enum';

describe('MembershipService', () => { 
  let service: MembershipService;
  let membershipProvider: {
    createMembership: jest.Mock;
    getActiveMembershipByUserId: jest.Mock;
  };

  beforeEach(async () => {
    membershipProvider = {
      createMembership: jest.fn(),
      getActiveMembershipByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: MembershipProvider,
          useValue: membershipProvider,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMembership', () => {
    it('should call membershipProvider.createMembership with the provided DTO and return its result', async () => {
      const createDto: CreateMembershipDto = {
        clientId: 'test-client-123',
        type: MembershipType.STANDARD, 
      };

      const expectedResult: Membership = {
        id: 'new-mem-id',
        clientId: createDto.clientId,
        type: createDto.type,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      membershipProvider.createMembership.mockResolvedValue(expectedResult);

      const result = await service.createMembership(createDto);

      expect(membershipProvider.createMembership).toHaveBeenCalledTimes(1);
      expect(membershipProvider.createMembership).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should rethrow any error from membershipProvider.createMembership', async () => {
      const createDto: CreateMembershipDto = {
        clientId: 'existing-client',
        type: MembershipType.PLATINUM, 
      };
      const expectedError = new Error('Client already has an active membership');

      membershipProvider.createMembership.mockRejectedValue(expectedError);

      await expect(service.createMembership(createDto)).rejects.toThrow(expectedError);
      expect(membershipProvider.createMembership).toHaveBeenCalledTimes(1);
      expect(membershipProvider.createMembership).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getActiveMembershipByUserId', () => {
    const userId = 'user-id-456';

    it('should call membershipProvider.getActiveMembershipByUserId and return its result', async () => {
      const expectedResult: Membership = {
        id: 'active-mem-id',
        clientId: userId,
        type: MembershipType.DIAMOND, 
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      membershipProvider.getActiveMembershipByUserId.mockResolvedValue(expectedResult);

      const result = await service.getActiveMembershipByUserId(userId);

      expect(membershipProvider.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipProvider.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should return null if membershipProvider returns null', async () => {
      membershipProvider.getActiveMembershipByUserId.mockResolvedValue(null);

      const result = await service.getActiveMembershipByUserId(userId);

      expect(membershipProvider.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipProvider.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('should rethrow any error from membershipProvider.getActiveMembershipByUserId', async () => {
      const expectedError = new Error('Database connection failed');
      membershipProvider.getActiveMembershipByUserId.mockRejectedValue(expectedError);

      await expect(service.getActiveMembershipByUserId(userId)).rejects.toThrow(expectedError);
      expect(membershipProvider.getActiveMembershipByUserId).toHaveBeenCalledTimes(1);
      expect(membershipProvider.getActiveMembershipByUserId).toHaveBeenCalledWith(userId);
    });
  });
});