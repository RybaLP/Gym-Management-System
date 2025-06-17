import { Test, TestingModule } from '@nestjs/testing';
import { BcryptProvider } from './bcrypt.provider'; 
import * as bcrypt from 'bcrypt'; 

describe('BcryptProvider', () => {
  let provider: BcryptProvider;
  let bcryptGenSaltSpy: jest.SpyInstance;
  let bcryptHashSpy: jest.SpyInstance;
  let bcryptCompareSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    bcryptGenSaltSpy = jest.spyOn(bcrypt, 'genSalt');
    bcryptHashSpy = jest.spyOn(bcrypt, 'hash');
    bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');


    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptProvider],
    }).compile();

    provider = module.get<BcryptProvider>(BcryptProvider);
  });


  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('hashPassword', () => {
    const plainPassword = 'MySecretPassword123!';
    const mockSalt = '$2b$10$abcdefghijklmnopqrstuvwx.1234567890'; 
    const mockHashedPassword = 'mockHashedPasswordValue';

    beforeEach(() => {
           
        bcryptGenSaltSpy.mockResolvedValue(mockSalt); 
        bcryptHashSpy.mockResolvedValue(mockHashedPassword); 
    });

    it('should call bcrypt.genSalt and bcrypt.hash', async () => {
      const hashedPassword = await provider.hashPassword(plainPassword);

      expect(bcryptGenSaltSpy).toHaveBeenCalledTimes(1);
      expect(bcryptGenSaltSpy).toHaveBeenCalledWith(10); 
      expect(bcryptHashSpy).toHaveBeenCalledTimes(1);
      expect(bcryptHashSpy).toHaveBeenCalledWith(plainPassword, mockSalt); 
      expect(hashedPassword).toBe(mockHashedPassword); 
    });

    it('should throw an error if bcrypt.genSalt fails', async () => {
      const expectedError = new Error('genSalt failed');
      bcryptGenSaltSpy.mockRejectedValue(expectedError); 

      await expect(provider.hashPassword(plainPassword)).rejects.toThrow(expectedError);
      expect(bcryptGenSaltSpy).toHaveBeenCalledTimes(1);
      expect(bcryptHashSpy).not.toHaveBeenCalled(); 
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      const expectedError = new Error('hashing failed');
      bcryptGenSaltSpy.mockResolvedValue(mockSalt);
      bcryptHashSpy.mockRejectedValue(expectedError); 

      await expect(provider.hashPassword(plainPassword)).rejects.toThrow(expectedError);
      expect(bcryptGenSaltSpy).toHaveBeenCalledTimes(1);
      expect(bcryptHashSpy).toHaveBeenCalledTimes(1);
      expect(bcryptHashSpy).toHaveBeenCalledWith(plainPassword, mockSalt);
    });
  });

  describe('comparePassword', () => {
    const plainPassword = 'MySecretPassword123!';
    const hashedPassword = 'actualHashedPasswordForComparison';

    beforeEach(() => {
        bcryptCompareSpy.mockResolvedValue(true); 
    });

    it('should call bcrypt.compare with correct parameters and return true for a match', async () => {
      const isMatch = await provider.comparePassword(plainPassword, hashedPassword);

      expect(bcryptCompareSpy).toHaveBeenCalledTimes(1);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for a non-matching password', async () => {
      const incorrectPassword = 'WrongPassword';
      bcryptCompareSpy.mockResolvedValue(false); 

      const isMatch = await provider.comparePassword(incorrectPassword, hashedPassword);

      expect(bcryptCompareSpy).toHaveBeenCalledTimes(1);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(incorrectPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should throw an error if bcrypt.compare fails', async () => {
      const expectedError = new Error('comparison failed');
      bcryptCompareSpy.mockRejectedValue(expectedError); 

      await expect(provider.comparePassword(plainPassword, hashedPassword)).rejects.toThrow(expectedError);
      expect(bcryptCompareSpy).toHaveBeenCalledTimes(1);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });
  });
});