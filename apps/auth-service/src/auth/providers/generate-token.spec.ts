import { Test, TestingModule } from '@nestjs/testing';
import { GenerateToken } from './generate-token';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthUser } from '../entities/auth-user.entity';

describe('GenerateToken', () => {
  let generateTokenService: GenerateToken;
  let jwtService: JwtService;

  const mockJwtService = {
    signAsync: jest.fn()
  };

  const mockJwtConfig: ConfigType<typeof jwtConfig> = {
    secret: 'mock-secret',
    issuer: 'mock-issuer',
    audience: 'mock-audience',
    accessTokenTtl: 3600
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateToken,
        { provide: JwtService, useValue: mockJwtService },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig }
      ],
    }).compile();

    generateTokenService = module.get<GenerateToken>(GenerateToken);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(generateTokenService).toBeDefined();
  });

  describe('signToken', () => {
    it('should call jwtService.signAsync with correct parameters', async () => {
      const clientId = '123';
      const expiresIn = 3600;
      const payload = { email: 'test@example.com', role: 'user' };

      mockJwtService.signAsync.mockResolvedValue('signed-token');

      const token = await generateTokenService.signToken(clientId, expiresIn, payload);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: clientId, ...payload },
        {
          audience: mockJwtConfig.audience,
          issuer: mockJwtConfig.issuer,
          secret: mockJwtConfig.secret,
          expiresIn
        }
      );
      expect(token).toBe('signed-token');
    });
  });

  describe('generateToken', () => {
    it('should generate a token from an AuthUser object', async () => {
      const authUser: AuthUser = {
        id: '123',
        email: 'test@example.com',
        role: 'client',
      } as AuthUser;

      mockJwtService.signAsync.mockResolvedValue('generated-token');

      const token = await generateTokenService.generateToken(authUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: authUser.id,
          email: authUser.email,
          role: authUser.role,
        },
        {
          audience: mockJwtConfig.audience,
          issuer: mockJwtConfig.issuer,
          secret: mockJwtConfig.secret,
          expiresIn: mockJwtConfig.accessTokenTtl
        }
      );

      expect(token).toBe('generated-token');
    });
  });
});
