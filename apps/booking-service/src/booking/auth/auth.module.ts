import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'; 

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ 
      secret: process.env.JWT_SECRET, 
    }),
  ],
  providers: [JwtStrategy], 
  exports: [PassportModule, JwtModule], 
})
export class AuthModule {}