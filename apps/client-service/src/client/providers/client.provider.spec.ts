import { Test, TestingModule } from '@nestjs/testing';
import { ClientProvider } from './client.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';

describe('ClientProvider', () => {
  let provider: ClientProvider;
  let clientRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    clientRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientProvider,
        {
          provide: getRepositoryToken(Client),
          useValue: clientRepository,
        },
      ],
    }).compile();

    provider = module.get<ClientProvider>(ClientProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createClient', () => {
    const createDto: CreateClientDto = {
      login: 'elozelo123',
      password: 'JustLongPassword123!@#',
      firstName: 'John',
      lastName: 'Doe',
      email: 'new@example.com',
      phone: '123456789',
    };

    const clientDataToPersist = {
        email: createDto.email,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        phone: createDto.phone,
    };

    const createdClient: Client = {
      id: 'client-id-1',
      email: createDto.email,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      phone: createDto.phone || '', 
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully create a new client', async () => {
      clientRepository.findOne.mockResolvedValue(null);
      clientRepository.create.mockReturnValue(createdClient);
      clientRepository.save.mockResolvedValue(createdClient);

      const result = await provider.createClient(createDto);

      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: [{ email: createDto.email }] });
      expect(clientRepository.create).toHaveBeenCalledTimes(1);
      expect(clientRepository.create).toHaveBeenCalledWith(expect.objectContaining(clientDataToPersist));
      expect(clientRepository.save).toHaveBeenCalledTimes(1);
      expect(clientRepository.save).toHaveBeenCalledWith(createdClient);
      expect(result).toEqual(createdClient);
    });

    it('should throw an error if client with email already exists', async () => {
      clientRepository.findOne.mockResolvedValue(createdClient);

      await expect(provider.createClient(createDto)).rejects.toThrow('Client with this email or login already exists!');
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.create).not.toHaveBeenCalled();
      expect(clientRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if saving the client fails', async () => {
      clientRepository.findOne.mockResolvedValue(null);
      clientRepository.create.mockReturnValue(createdClient);
      clientRepository.save.mockRejectedValue(new Error('Database save error'));

      await expect(provider.createClient(createDto)).rejects.toThrow('Could not create client!');
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.create).toHaveBeenCalledTimes(1);
      expect(clientRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllClients', () => {
    it('should return a list of active clients', async () => {
      const clients: Client[] = [
        { id: 'c1', email: 'c1@ex.com', firstName: 'A', lastName: 'A', phone: '1', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'c2', email: 'c2@ex.com', firstName: 'B', lastName: 'B', phone: '2', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      clientRepository.find.mockResolvedValue(clients);

      const result = await provider.findAllClients();

      expect(clientRepository.find).toHaveBeenCalledTimes(1);
      expect(clientRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(result).toEqual(clients);
    });

    it('should return an empty array if no active clients are found', async () => {
      clientRepository.find.mockResolvedValue([]);

      const result = await provider.findAllClients();

      expect(clientRepository.find).toHaveBeenCalledTimes(1);
      expect(clientRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(result).toEqual([]);
    });
  });

  describe('findClientById', () => {
    const clientId = 'client-id-to-find';
    const mockClient: Client = {
      id: clientId, email: 'find@example.com', firstName: 'F', lastName: 'F', phone: '3', isActive: true, createdAt: new Date(), updatedAt: new Date()
    };

    it('should return the client if found and active', async () => {
      clientRepository.findOne.mockResolvedValue(mockClient);

      const result = await provider.findClientById(clientId);

      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { id: clientId, isActive: true } });
      expect(result).toEqual(mockClient);
    });

    it('should throw an error if client does not exist or is not active', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(provider.findClientById(clientId)).rejects.toThrow(`Client with ID ${clientId} does not exist or is not active.`);
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('softDeleteClient', () => {
    const clientId = 'client-id-to-delete';
    const activeClient: Client = {
      id: clientId, email: 'del@ex.com', firstName: 'D', lastName: 'D', phone: '4', isActive: true, createdAt: new Date(), updatedAt: new Date()
    };
    const inactiveClient: Client = {
      id: clientId, email: 'del@ex.com', firstName: 'D', lastName: 'D', phone: '4', isActive: false, createdAt: new Date(), updatedAt: new Date()
    };

    it('should set client to inactive successfully', async () => {
      clientRepository.findOne.mockResolvedValue(activeClient);
      clientRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      await expect(provider.softDeleteClient(clientId)).resolves.toBeUndefined();
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { id: clientId } });
      expect(clientRepository.update).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledWith(clientId, { isActive: false });
    });

    it('should throw an error if client does not exist', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(provider.softDeleteClient(clientId)).rejects.toThrow(`Client with ID ${clientId} does not exist.`);
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if client is already inactive', async () => {
      clientRepository.findOne.mockResolvedValue(inactiveClient);

      await expect(provider.softDeleteClient(clientId)).rejects.toThrow(`Client with ID ${clientId} is already inactive!`);
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if updating client to inactive fails', async () => {
      clientRepository.findOne.mockResolvedValue(activeClient);
      clientRepository.update.mockRejectedValue(new Error('Database update error'));

      await expect(provider.softDeleteClient(clientId)).rejects.toThrow('Could not set client to inactive! ');
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledWith(clientId, { isActive: false });
    });
  });

  describe('updateClient', () => {
    const clientId = 'client-id-to-update';
    const updateDto: UpdateClientDto = { firstName: 'Updated', phone: '999888777' };
    const originalClient: Client = {
      id: clientId, email: 'upd@ex.com', firstName: 'Original', lastName: 'Last', phone: '123123123', isActive: true, createdAt: new Date(), updatedAt: new Date()
    };
    const updatedClientAfterSave: Client = {
      ...originalClient, firstName: 'Updated', phone: '999888777', updatedAt: new Date()
    };

    it('should update client successfully and return the updated client', async () => {
      clientRepository.findOne.mockResolvedValueOnce(originalClient);
      clientRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);
      clientRepository.findOne.mockResolvedValueOnce(updatedClientAfterSave);

      const result = await provider.updateClient(clientId, updateDto);

      expect(clientRepository.findOne).toHaveBeenCalledTimes(2);
      expect(clientRepository.findOne).toHaveBeenNthCalledWith(1, { where: { id: clientId, isActive: true } });
      expect(clientRepository.update).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledWith(clientId, updateDto);
      expect(clientRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: clientId } });
      expect(result).toEqual(updatedClientAfterSave);
    });

    it('should return original client if no rows were affected by update', async () => {
      clientRepository.findOne.mockResolvedValueOnce(originalClient);
      clientRepository.update.mockResolvedValue({ affected: 0 } as UpdateResult);

      const result = await provider.updateClient(clientId, updateDto);

      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledWith(clientId, updateDto);
      expect(clientRepository.findOne).not.toHaveBeenNthCalledWith(2, { where: { id: clientId } });
      expect(result).toEqual(originalClient);
    });

    it('should throw an error if client does not exist or is not active', async () => {
      clientRepository.findOne.mockResolvedValue(null);

      await expect(provider.updateClient(clientId, updateDto)).rejects.toThrow(
        `Client with ID ${clientId} does not exist or is not active.`,
      );
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if updating client fails', async () => {
      clientRepository.findOne.mockResolvedValueOnce(originalClient);
      clientRepository.update.mockRejectedValue(new Error('Database update error'));

      await expect(provider.updateClient(clientId, updateDto)).rejects.toThrow('Could not update client!');
      expect(clientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledTimes(1);
      expect(clientRepository.update).toHaveBeenCalledWith(clientId, updateDto);
    });
  });
});