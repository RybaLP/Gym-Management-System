
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service'; 
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthUser } from './entities/auth-user.entity';
import { UserRole } from './enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    registerUser: jest.Mock;
    signUser: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      registerUser: jest.fn(),
      signUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call authService.registerUser and return its result', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
      };
      const expectedResult = {
        accessToken: 'mock-access-token',
        user: { id: 'uuid-1', email: 'test@example.com', role: UserRole.CLIENT } as AuthUser,
      };

      authService.registerUser.mockResolvedValue(expectedResult);

      const result = await controller.registerUser(registerDto);

      expect(authService.registerUser).toHaveBeenCalledTimes(1);
      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should rethrow any error from authService.registerUser', async () => {
      const registerDto: RegisterUserDto = {
        email: 'error@example.com',
        password: 'Password123!',
        firstName: 'Error',
        lastName: 'Test',
        phone: '987654321',
      };
      const expectedError = new Error('Email already registered');

      authService.registerUser.mockRejectedValue(expectedError);

      await expect(controller.registerUser(registerDto)).rejects.toThrow(expectedError);
      expect(authService.registerUser).toHaveBeenCalledTimes(1);
      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('loginUser', () => {
    it('should call authService.signUser and return its result', async () => {
      const loginDto: LoginUserDto = {
        email: 'login@example.com',
        password: 'Password123!',
      };
      const expectedResult = {
        accessToken: 'mock-login-token',
        user: { id: 'uuid-2', email: 'login@example.com', role: UserRole.CLIENT } as AuthUser,
      };

      authService.signUser.mockResolvedValue(expectedResult);

      const result = await controller.loginUser(loginDto);

      expect(authService.signUser).toHaveBeenCalledTimes(1);
      expect(authService.signUser).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should rethrow any error from authService.signUser', async () => {
      const loginDto: LoginUserDto = {
        email: 'error@example.com',
        password: 'WrongPassword',
      };
      const expectedError = new Error('Invalid credentials');

      authService.signUser.mockRejectedValue(expectedError);

      await expect(controller.loginUser(loginDto)).rejects.toThrow(expectedError);
      expect(authService.signUser).toHaveBeenCalledTimes(1);
      expect(authService.signUser).toHaveBeenCalledWith(loginDto);
    });
  });
});