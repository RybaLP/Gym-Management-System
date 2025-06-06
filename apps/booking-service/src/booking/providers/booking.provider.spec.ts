import { Test, TestingModule } from '@nestjs/testing';
import { BookingProvider } from './booking.provider';

describe('BookingProvider', () => {
  let provider: BookingProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingProvider],
    }).compile();

    provider = module.get<BookingProvider>(BookingProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
