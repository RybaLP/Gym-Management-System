import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientModule } from './client/client.module';
import { AuthModule } from './client/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal : true,
        envFilePath : 'apps/client-service/.env'
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
         synchronize : true /// for development only 
      }),
    }),
    ClientModule,
    AppModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
