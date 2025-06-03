import { Test, TestingModule } from '@nestjs/testing';
import { MembershipProvider } from './membership.provider';

describe('MembershipProvider', () => {
  let provider: MembershipProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipProvider],
    }).compile();

    provider = module.get<MembershipProvider>(MembershipProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
