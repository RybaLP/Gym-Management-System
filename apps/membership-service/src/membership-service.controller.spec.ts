import { Test, TestingModule } from '@nestjs/testing';
import { MembershipServiceController } from './membership-service.controller';
import { MembershipServiceService } from './membership-service.service';

describe('MembershipServiceController', () => {
  let membershipServiceController: MembershipServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MembershipServiceController],
      providers: [MembershipServiceService],
    }).compile();

    membershipServiceController = app.get<MembershipServiceController>(MembershipServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(membershipServiceController.getHello()).toBe('Hello World!');
    });
  });
});
