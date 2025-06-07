import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingModule } from './booking/booking.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal : true,
        envFilePath : 'apps/booking-service/.env'
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
    BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
