import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from './auth.provider';
describe('Auth', () => {
  let provider: AuthProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthProvider],
    }).compile();

    provider = module.get<AuthProvider>(AuthProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
