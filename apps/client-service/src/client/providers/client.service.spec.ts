import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientProvider } from './client.provider'; 
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { Client } from '../entities/client.entity';

describe('ClientService', () => {
  let service: ClientService;
  let clientProvider: {
    findAllClients: jest.Mock;
    findClientById: jest.Mock;
    createClient: jest.Mock;
    updateClient: jest.Mock;
    softDeleteClient: jest.Mock; 
  };

  beforeEach(async () => {
    clientProvider = {
      findAllClients: jest.fn(),
      findClientById: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      softDeleteClient: jest.fn(),
    };

    jest.clearAllMocks(); 

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: ClientProvider,
          useValue: clientProvider,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllClients', () => {
    it('should call clientProvider.findAllClients and return its result', async () => {
      const mockClients: Client[] = [
        { id: 'c1', email: 'c1@ex.com', firstName: 'A', lastName: 'A', phone: '1', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      clientProvider.findAllClients.mockResolvedValue(mockClients);

      const result = await service.findAllClients();

      expect(clientProvider.findAllClients).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockClients);
    });

    it('should rethrow any error from clientProvider.findAllClients', async () => {
      const expectedError = new Error('Database error during find all');
      clientProvider.findAllClients.mockRejectedValue(expectedError);

      await expect(service.findAllClients()).rejects.toThrow(expectedError);
      expect(clientProvider.findAllClients).toHaveBeenCalledTimes(1);
    });
  });

  describe('findClientById', () => {
    const clientId = 'test-client-id';
    const mockClient: Client = {
      id: clientId, email: 'test@ex.com', firstName: 'Test', lastName: 'Client', phone: '123', isActive: true, createdAt: new Date(), updatedAt: new Date()
    };

    it('should call clientProvider.findClientById and return its result', async () => {
      clientProvider.findClientById.mockResolvedValue(mockClient);

      const result = await service.findClientById(clientId);

      expect(clientProvider.findClientById).toHaveBeenCalledTimes(1);
      expect(clientProvider.findClientById).toHaveBeenCalledWith(clientId);
      expect(result).toEqual(mockClient);
    });

    it('should rethrow any error from clientProvider.findClientById', async () => {
      const expectedError = new Error('Client not found');
      clientProvider.findClientById.mockRejectedValue(expectedError);

      await expect(service.findClientById(clientId)).rejects.toThrow(expectedError);
      expect(clientProvider.findClientById).toHaveBeenCalledTimes(1);
      expect(clientProvider.findClientById).toHaveBeenCalledWith(clientId);
    });
  });

  describe('createClient', () => {
    const createDto: CreateClientDto = {
      login: 'newuser', password: 'password123', firstName: 'New', lastName: 'User', email: 'newuser@example.com', phone: '987654321'
    };
    const mockCreatedClient: Client = {
      id: 'new-id', email: createDto.email, firstName: createDto.firstName, lastName: createDto.lastName, phone: createDto.phone!, isActive: true, createdAt: new Date(), updatedAt: new Date()
    };

    it('should call clientProvider.createClient and return its result', async () => {
      clientProvider.createClient.mockResolvedValue(mockCreatedClient);

      const result = await service.createClient(createDto);

      expect(clientProvider.createClient).toHaveBeenCalledTimes(1);
      expect(clientProvider.createClient).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCreatedClient);
    });

    it('should rethrow any error from clientProvider.createClient', async () => {
      const expectedError = new Error('Client already exists');
      clientProvider.createClient.mockRejectedValue(expectedError);

      await expect(service.createClient(createDto)).rejects.toThrow(expectedError);
      expect(clientProvider.createClient).toHaveBeenCalledTimes(1);
      expect(clientProvider.createClient).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateClient', () => {
    const clientId = 'update-client-id';
    const updateDto: UpdateClientDto = { firstName: 'UpdatedName', phone: '111222333' };
    const mockUpdatedClient: Client = {
      id: clientId, email: 'upd@ex.com', firstName: 'UpdatedName', lastName: 'Last', phone: '111222333', isActive: true, createdAt: new Date(), updatedAt: new Date()
    };

    it('should call clientProvider.updateClient and return its result', async () => {
      clientProvider.updateClient.mockResolvedValue(mockUpdatedClient);

      const result = await service.updateClient(clientId, updateDto);

      expect(clientProvider.updateClient).toHaveBeenCalledTimes(1);
      expect(clientProvider.updateClient).toHaveBeenCalledWith(clientId, updateDto);
      expect(result).toEqual(mockUpdatedClient);
    });

    it('should rethrow any error from clientProvider.updateClient', async () => {
      const expectedError = new Error('Update failed');
      clientProvider.updateClient.mockRejectedValue(expectedError);

      await expect(service.updateClient(clientId, updateDto)).rejects.toThrow(expectedError);
      expect(clientProvider.updateClient).toHaveBeenCalledTimes(1);
      expect(clientProvider.updateClient).toHaveBeenCalledWith(clientId, updateDto);
    });
  });

  describe('deleteClient', () => {
    const clientId = 'delete-client-id';

    it('should call clientProvider.softDeleteClient', async () => {
      clientProvider.softDeleteClient.mockResolvedValue(undefined); 

      await expect(service.deleteClient(clientId)).resolves.toBeUndefined();

      expect(clientProvider.softDeleteClient).toHaveBeenCalledTimes(1);
      expect(clientProvider.softDeleteClient).toHaveBeenCalledWith(clientId);
    });

    it('should rethrow any error from clientProvider.softDeleteClient', async () => {
      const expectedError = new Error('Delete failed');
      clientProvider.softDeleteClient.mockRejectedValue(expectedError);

      await expect(service.deleteClient(clientId)).rejects.toThrow(expectedError);
      expect(clientProvider.softDeleteClient).toHaveBeenCalledTimes(1);
      expect(clientProvider.softDeleteClient).toHaveBeenCalledWith(clientId);
    });
  });
});