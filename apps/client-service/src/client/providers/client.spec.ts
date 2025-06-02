import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';

describe('Client', () => {
  let provider: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientService],
    }).compile();

    provider = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
