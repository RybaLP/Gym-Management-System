import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal : true,
        envFilePath : 'apps/auth-service/.env'
    }),
    TypeOrmModule.forRootAsync({
      imports : [ConfigModule],
      inject : [ConfigService],
      useFactory : (configService : ConfigService) => ({
         type: "postgres",
         host: configService.get<string>('DATABASE_HOST'),
         port: configService.get<number>('DATABASE_PORT'),
         username: configService.get<string>('DATABASE_USERNAME'),
         password: configService.get<string>('DATABASE_PASSWORD'),
         database: configService.get<string>('DATABASE_NAME'),
         autoLoadEntities : true,
         synchronize : true 
      }),
    }),
    AuthModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}