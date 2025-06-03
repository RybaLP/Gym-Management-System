import { Test, TestingModule } from '@nestjs/testing';
import { MembershipControllerService } from './membership.controller.service';

describe('MembershipControllerService', () => {
  let service: MembershipControllerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipControllerService],
    }).compile();

    service = module.get<MembershipControllerService>(MembershipControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
