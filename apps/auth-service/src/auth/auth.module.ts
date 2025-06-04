import { Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { Auth } from './providers/auth.provider';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, Auth],
  controllers: [AuthController]
})
export class AuthModule {}
