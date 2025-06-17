import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from './auth.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { HttpService } from '@nestjs/axios';
import { HashingProvider } from './hashing.provider';
import { GenerateToken } from './generate-token';
import { of, throwError } from "rxjs"; // Upewnij się, że masz throwError tutaj
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserRole } from '../enums/user-role.enum';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'; // Dodaj UnauthorizedException
import { AxiosError, AxiosResponse } from 'axios';
// catchError nie jest już potrzebny w tym pliku, jeśli używasz throwError bezpośrednio, ale nie zaszkodzi go zostawić
// import { catchError } from 'rxjs/operators';

describe('AuthProvider', () => {
  let authProvider: AuthProvider;
  let authUserRepository: {
    findOne: jest.Mock<Promise<AuthUser | null>>;
    create: jest.Mock<AuthUser>;
    save: jest.Mock<Promise<AuthUser>>;
    delete: jest.Mock<Promise<any>>;
  };
  let httpService: {
    post: jest.Mock<ReturnType<HttpService['post']>>;
  };
  let hashingProvider: {
    hashPassword: jest.Mock<Promise<string>>;
    comparePassword: jest.Mock<Promise<boolean>>;
  };
  let generateTokenProvider: {
    generateToken: jest.Mock<Promise<string>>;
  };

  beforeEach(async () => {
    authUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    httpService = {
      post: jest.fn(),
    };

    hashingProvider = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    generateTokenProvider = {
      generateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProvider,
        {
          provide: getRepositoryToken(AuthUser),
          useValue: authUserRepository,
        },
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: HashingProvider,
          useValue: hashingProvider,
        },
        {
          provide: GenerateToken,
          useValue: generateTokenProvider,
        },
      ],
    }).compile();

    authProvider = module.get<AuthProvider>(AuthProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authProvider).toBeDefined();
  });

  describe('registerUser', () => {
    const registerDto: RegisterUserDto = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '123456789',
    };

    const createdAuthUser: AuthUser = {
      id: 'some-uuid-123',
      email: registerDto.email,
      password: 'hashedPassword123',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully register a new user and return an access token', async () => {
      authUserRepository.findOne.mockResolvedValue(null);
      hashingProvider.hashPassword.mockResolvedValue('hashedPassword123');
      authUserRepository.create.mockReturnValue(createdAuthUser);
      authUserRepository.save.mockResolvedValue(createdAuthUser);
      const mockAxiosResponse: AxiosResponse = { data: { status: 'success' }, status: 201, statusText: 'Created', headers: {}, config: {} as any };
      httpService.post.mockReturnValue(of(mockAxiosResponse));
      generateTokenProvider.generateToken.mockResolvedValue('mockAccessToken');

      const result = await authProvider.registerUser(registerDto);

      expect(authUserRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(hashingProvider.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(authUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        password: 'hashedPassword123',
        role: UserRole.CLIENT,
        isActive: true,
      }));
      expect(authUserRepository.save).toHaveBeenCalledWith(createdAuthUser);
      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          id: createdAuthUser.id,
          email: createdAuthUser.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          phone: registerDto.phone,
        })
      );
      expect(generateTokenProvider.generateToken).toHaveBeenCalledWith(createdAuthUser);
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        user: {
          id: createdAuthUser.id,
          email: createdAuthUser.email,
          role: createdAuthUser.role,
        },
      });
      expect(authUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user with email already exists', async () => {
      authUserRepository.findOne.mockResolvedValue(createdAuthUser);

      await expect(authProvider.registerUser(registerDto)).rejects.toThrow(BadRequestException);
      await expect(authProvider.registerUser(registerDto)).rejects.toThrow('User with this email already exists');

      expect(authUserRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(hashingProvider.hashPassword).not.toHaveBeenCalled();
      expect(authUserRepository.create).not.toHaveBeenCalled();
      expect(authUserRepository.save).not.toHaveBeenCalled();
      expect(httpService.post).not.toHaveBeenCalled();
      expect(generateTokenProvider.generateToken).not.toHaveBeenCalled();
      expect(authUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should rollback user creation if httpService.post fails', async () => {
      authUserRepository.findOne.mockResolvedValue(null);
      hashingProvider.hashPassword.mockResolvedValue('hashedPassword123');
      authUserRepository.create.mockReturnValue(createdAuthUser);
      authUserRepository.save.mockResolvedValue(createdAuthUser);

      const mockAxiosError = new AxiosError(
        'Request failed with status code 500',
        'ERR_BAD_RESPONSE',
        {} as any,
        {} as any,
        {
          data: 'Failed to create profile on client service',
          status: 500,
          headers: {},
          config: {} as any,
          statusText: 'Internal Server Error',
        }
      );
      httpService.post.mockReturnValue(throwError(() => mockAxiosError));

      generateTokenProvider.generateToken.mockResolvedValue('mockAccessToken');

      await expect(authProvider.registerUser(registerDto)).rejects.toThrow(InternalServerErrorException);
      await expect(authProvider.registerUser(registerDto)).rejects.toThrow('Failed to create profile!');

      expect(authUserRepository.findOne).toHaveBeenCalled();
      expect(hashingProvider.hashPassword).toHaveBeenCalled();
      expect(authUserRepository.create).toHaveBeenCalled();
      expect(authUserRepository.save).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalled();
      expect(generateTokenProvider.generateToken).not.toHaveBeenCalled();
      expect(authUserRepository.delete).toHaveBeenCalledWith(createdAuthUser.id);
    });

    it('should rollback user creation if token generation fails', async () => {
      authUserRepository.findOne.mockResolvedValue(null);
      hashingProvider.hashPassword.mockResolvedValue('hashedPassword123');
      authUserRepository.create.mockReturnValue(createdAuthUser);
      authUserRepository.save.mockResolvedValue(createdAuthUser);
      const mockAxiosResponse: AxiosResponse = { data: { status: 'success' }, status: 201, statusText: 'Created', headers: {}, config: {} as any };
      httpService.post.mockReturnValue(of(mockAxiosResponse));
      // Mockujemy, że generowanie tokenu rzuca błąd
      generateTokenProvider.generateToken.mockRejectedValue(new Error('Token generation failed!'));

      await expect(authProvider.registerUser(registerDto)).rejects.toThrow('Could not generate access token ! ');

      expect(authUserRepository.findOne).toHaveBeenCalled();
      expect(hashingProvider.hashPassword).toHaveBeenCalled();
      expect(authUserRepository.create).toHaveBeenCalled();
      expect(authUserRepository.save).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalled();
      expect(generateTokenProvider.generateToken).toHaveBeenCalled();
      expect(authUserRepository.delete).toHaveBeenCalledWith(createdAuthUser.id);
    });
  });


  describe('signIn', () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'CorrectPassword123',
    };

    const existingAuthUser: AuthUser = {
      id: 'existing-uuid-456',
      email: loginDto.email,
      password: 'hashedCorrectPassword123', 
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully sign in a user and return an access token', async () => {

      authUserRepository.findOne.mockResolvedValue(existingAuthUser);

      hashingProvider.comparePassword.mockResolvedValue(true);

      generateTokenProvider.generateToken.mockResolvedValue('mockAccessTokenForSignIn');

      const result = await authProvider.signIn(loginDto);

      // Asercje
      expect(authUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'email', 'password', 'role', 'isActive']
      });
      expect(hashingProvider.comparePassword).toHaveBeenCalledWith(loginDto.password, existingAuthUser.password);
      expect(generateTokenProvider.generateToken).toHaveBeenCalledWith(existingAuthUser);
      expect(result).toEqual({ accessToken: 'mockAccessTokenForSignIn' });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {

      authUserRepository.findOne.mockResolvedValue(null);

      await expect(authProvider.signIn(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authProvider.signIn(loginDto)).rejects.toThrow('Invalid credentials');

      // Asercje
      expect(authUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'email', 'password', 'role', 'isActive']
      });
      expect(hashingProvider.comparePassword).not.toHaveBeenCalled();
      expect(generateTokenProvider.generateToken).not.toHaveBeenCalled(); 
    });

    it('should throw UnauthorizedException if provided password does not match', async () => {

      authUserRepository.findOne.mockResolvedValue(existingAuthUser);

      hashingProvider.comparePassword.mockResolvedValue(false);

      await expect(authProvider.signIn(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authProvider.signIn(loginDto)).rejects.toThrow('Invalid credentials'); 

      // Asercje
      expect(authUserRepository.findOne).toHaveBeenCalled();
      expect(hashingProvider.comparePassword).toHaveBeenCalledWith(loginDto.password, existingAuthUser.password);
      expect(generateTokenProvider.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const inactiveUser: AuthUser = { ...existingAuthUser, isActive: false };

      authUserRepository.findOne.mockResolvedValue(inactiveUser);
      hashingProvider.comparePassword.mockResolvedValue(true);

      await expect(authProvider.signIn(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authProvider.signIn(loginDto)).rejects.toThrow('Account is inactive. Please contact support');

      expect(authUserRepository.findOne).toHaveBeenCalled();
      expect(hashingProvider.comparePassword).not.toHaveBeenCalled(); 
      expect(generateTokenProvider.generateToken).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if user fetch fails', async () => {
      authUserRepository.findOne.mockRejectedValue(new Error('Database connection lost'));

      await expect(authProvider.signIn(loginDto)).rejects.toThrow(InternalServerErrorException);
      await expect(authProvider.signIn(loginDto)).rejects.toThrow('Could not fetch the user. Please try again later.');

      expect(authUserRepository.findOne).toHaveBeenCalled();
      expect(hashingProvider.comparePassword).not.toHaveBeenCalled();
      expect(generateTokenProvider.generateToken).not.toHaveBeenCalled();
    });
  });
});