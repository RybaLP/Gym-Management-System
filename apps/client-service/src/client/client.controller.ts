import { Body, Controller, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { Patch, Post, Get, Delete } from '@nestjs/common';
import { CreateClientDto } from './dtos/create-client.dto';
import { ClientService } from './providers/client.service';
import { UpdateClientDto } from './dtos/update-client.dto';
import { ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('client')
export class ClientController {

    constructor(private readonly clientService : ClientService){}

    @Get()
    public findAllClients(){
        return this.clientService.findAllClients()
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'))
    public findClientById(@Param('id', ParseIntPipe) id : string){
        return this.clientService.findClientById(id)
    }

    @Post()
    // @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    public createClient(@Body() createClientDto : CreateClientDto){
        return this.clientService.createClient(createClientDto);
    }

    @Patch('/:id')
    @UseGuards(AuthGuard('jwt'))
    public editClient(@Param('id', ParseIntPipe) id : string, editClientDto : UpdateClientDto){
        return this.clientService.updateClient(id , editClientDto)
    }

    @Delete('/:id')
    @UseGuards(AuthGuard('jwt'))
    public deleteClient(@Param('id', ParseIntPipe) id : string){
        return this.clientService.deleteClient(id)
    }

}
