import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';

@Injectable()
export class ClientProvider {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository : Repository<Client>
    ){}

    public createClient = async (createClientDto : CreateClientDto) : Promise<Client> => {
      
        const existingClient = await this.clientRepository.findOne({
            where : [
                {email: createClientDto.email},
            ] 
        })
        if(existingClient){
            throw new Error("Client with this email or login already exists!")
        }
        try {
            const newClient = this.clientRepository.create(createClientDto);
            await this.clientRepository.save(newClient);
            return newClient;            
        } catch (error) {
            throw new Error("Could not create client!");
        }
    }

    public findAllClients = async () : Promise<Client[]> => {
        return await this.clientRepository.find({
            where : {isActive : true}
        });
    }

    public findClientById = async (id : string) : Promise<Client | undefined> => {

        const client = await this.clientRepository.findOne({
            where : {id : id , isActive : true}
        })

         if (!client) {
            throw new Error(`Client with ID ${id} does not exist or is not active.`);
        }
        
        return client;
    }

    public softDeleteClient = async (id : string) : Promise<void> => {
        const client = await this.clientRepository.findOne({
            where : {
                id : id
            }
        })

        if(!client){
            throw new Error(`Client with ID ${id} does not exist.`);
        }

        if(!client.isActive){
            throw new Error(`Client with ID ${id} is already inactive!`);
        }

        try {
            await this.clientRepository.update(id, {isActive : false});
        } catch (error) {
            throw new Error("Could not set client to inactive! ");
        }
    }

    public  updateClient = async (id: string, updateClientDto: UpdateClientDto): Promise<Client | null> => {
        const client = await this.clientRepository.findOne({ where: { id: id, isActive: true }});

        if (!client) {
            throw new Error(`Client with ID ${id} does not exist or is not active.`);
        }

            try {
                const updateResult = await this.clientRepository.update(id, updateClientDto);
        
                if (updateResult.affected === 0) {
                    return client; 
                }
        
                const updatedClient = await this.clientRepository.findOne({ where: { id: id } });
        
                return updatedClient;
        
            } catch (error) {
                console.error("Error updating client:", error); 
                throw new Error("Could not update client!");
            }
}
}
