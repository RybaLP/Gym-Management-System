import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './providers/client.service';
import { Client } from './entities/client.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProvider } from './providers/client.provider';

@Module({
  imports : [TypeOrmModule.forFeature([Client])],
  controllers: [ClientController],
  providers: [ClientService, Client, ClientProvider], 
})
export class ClientModule {}
