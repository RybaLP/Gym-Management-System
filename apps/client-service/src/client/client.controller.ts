import { Body, Controller, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { Patch, Post, Get, Delete } from '@nestjs/common';
import { CreateClientDto } from './dtos/create-client.dto';
import { ClientService } from './providers/client.service';
import { UpdateClientDto } from './dtos/update-client.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('client')
export class ClientController {

    constructor(private readonly clientService : ClientService){}

    @Get()
    public findAllClients(){
        return this.clientService.findAllClients()
    }

    @Get('/:id')
    public findClientById(@Param('id', ParseIntPipe) id : number){
        return this.clientService.findClientById(id)
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    public createClient(@Body() createClientDto : CreateClientDto){
        return this.clientService.createClient(createClientDto);
    }

    @Patch('/:id')
    public editClient(@Param('id', ParseIntPipe) id : number, editClientDto : UpdateClientDto){
        return this.clientService.updateClient(id , editClientDto)
    }

    @Delete('/:id')
    public deleteClient(@Param('id', ParseIntPipe) id : number){
        return this.clientService.deleteClient(id)
    }

}
