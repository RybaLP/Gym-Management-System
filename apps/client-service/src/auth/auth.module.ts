import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { ClientModule } from '../client/client.module';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { ConfigModule } from '@nestjs/config';


@Module({
  controllers: [AuthController],
  providers: [AuthService, GenerateTokensProvider],
  imports : [ClientModule],
})
export class AuthModule {}
