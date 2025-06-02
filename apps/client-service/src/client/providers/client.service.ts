import { Injectable } from '@nestjs/common';
import { ClientProvider } from './client.provider';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';

@Injectable()
export class ClientService {
    constructor(
        private readonly clientProvider : ClientProvider
    ){}

    public findAllClients = async () => {
        return await this.clientProvider.findAllClients()
    }

    public findClientById = async (id : number) => {
        return await this.clientProvider.findClientById(id)
    }

    public createClient = async (createClientDto : CreateClientDto) => {
        return await this.clientProvider.createClient(createClientDto);
    } 
    
    public updateClient = async (id : number , updateClientDto : UpdateClientDto) => {
        return await this.clientProvider.updateClient(id , updateClientDto)
    }

    public deleteClient = async (id : number) => {
        return await this.clientProvider.softDeleteClient(id);
    }
}