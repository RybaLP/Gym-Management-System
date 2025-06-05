import { Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUser } from './entities/auth-user.entity';
import { GenerateToken } from './providers/generate-token';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthProvider } from './providers/auth.provider';

@Module({
  providers: [AuthService, GenerateToken,BcryptProvider,{provide : HashingProvider, useClass : BcryptProvider}, AuthProvider],
  controllers: [AuthController],
  imports : [
        TypeOrmModule.forFeature([AuthUser]),
        HttpModule, 
        ConfigModule.forFeature(jwtConfig), 
        JwtModule.registerAsync({ 
            imports: [ConfigModule.forFeature(jwtConfig)], 
            inject: [ConfigService, jwtConfig.KEY],
            useFactory: (configService: ConfigService, jwtConfiguration: ConfigType<typeof jwtConfig>) => ({
                secret: jwtConfiguration.secret,
                signOptions: {
                    expiresIn: jwtConfiguration.accessTokenTtl, 
                    audience: jwtConfiguration.audience,
                    issuer: jwtConfiguration.issuer,
                },
            }),
        }),
    ],
    exports : [AuthService]
})
export class AuthModule {}