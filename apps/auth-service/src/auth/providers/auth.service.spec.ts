import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthProvider } from './auth.provider'; 
import { RegisterUserDto } from '../dtos/register-user.dto'; 
import { LoginUserDto } from '../dtos/login-user.dto'; 
import { AuthUser } from '../entities/auth-user.entity'; 
import { UserRole } from '../enums/user-role.enum'; 

describe('AuthService', () => { 
  let service: AuthService;
  let authProvider: {
    registerUser: jest.Mock;
    signIn: jest.Mock;
  };

  beforeEach(async () => {
    authProvider = {
      registerUser: jest.fn(),
      signIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthProvider,
          useValue: authProvider,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call authProvider.registerUser with the provided DTO', async () => {
      
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
      };

      const expectedResult = {
        accessToken: 'mock-access-token',
        user: {
          id: 'some-uuid',
          email: 'test@example.com',
          role: UserRole.CLIENT, 
          isActive: true,
        } as AuthUser,
      };
      authProvider.registerUser.mockResolvedValue(expectedResult);

      const result = await service.registerUser(registerDto);

      expect(authProvider.registerUser).toHaveBeenCalledTimes(1);
      expect(authProvider.registerUser).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should rethrow any error from authProvider.registerUser', async () => {
      const registerDto: RegisterUserDto = {
        email: 'error@example.com',
        password: 'Password123!',
        firstName: 'Error',
        lastName: 'Test',
        phone: '987654321',
      };
      const expectedError = new Error('User already exists');
      authProvider.registerUser.mockRejectedValue(expectedError);

      await expect(service.registerUser(registerDto)).rejects.toThrow(expectedError);
      expect(authProvider.registerUser).toHaveBeenCalledTimes(1);
      expect(authProvider.registerUser).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('signUser', () => {
    it('should call authProvider.signIn with the provided DTO', async () => {
      const loginDto: LoginUserDto = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      const expectedResult = {
        accessToken: 'mock-signed-token',
        user: {
          id: 'another-uuid',
          email: 'login@example.com',
          role: UserRole.CLIENT,
          isActive: true,
        } as AuthUser,
      };
      authProvider.signIn.mockResolvedValue(expectedResult);

      const result = await service.signUser(loginDto);

      expect(authProvider.signIn).toHaveBeenCalledTimes(1);
      expect(authProvider.signIn).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should rethrow any error from authProvider.signIn', async () => {
      const loginDto: LoginUserDto = {
        email: 'error@example.com',
        password: 'WrongPassword',
      };
      const expectedError = new Error('Invalid credentials');
      authProvider.signIn.mockRejectedValue(expectedError);

      await expect(service.signUser(loginDto)).rejects.toThrow(expectedError);
      expect(authProvider.signIn).toHaveBeenCalledTimes(1);
      expect(authProvider.signIn).toHaveBeenCalledWith(loginDto);
    });
  });
});