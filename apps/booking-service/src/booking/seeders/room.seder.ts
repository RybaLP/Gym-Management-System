import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Room } from "../entities/room";
import { RoomName } from "../enums/room.enum";

// it is unnecesary to add manualy each room because their puropse is only to create book service, which means this Room seder
// is adding rooms automaticaly in case , if they do not exist in database

@Injectable()
export class RoomSeeder implements OnModuleInit {
    constructor(
        @InjectRepository(Room)
        private readonly roomRepository : Repository<Room>
    ){}

    async onModuleInit() {
        console.log('RoomSeeder initialized. Starting room seeding process...');
        await this.seedRooms();
    }

    private async seedRooms (){
        const existingRoomsCount = await this.roomRepository.count();
        if(existingRoomsCount === 0){
            const roomsToSeed = [
                {name : RoomName.TRAINING_ROOM_1, isActive : true},
                {name : RoomName.TRAINING_ROOM_2, isActive : true},
                {name : RoomName.TRAINING_ROOM_3, isActive : true},
                { name: RoomName.AROMATHERAPY_ROOM, isActive: true },
                { name: RoomName.DEFAULT_SAUNA, isActive: true },
                { name: RoomName.ICE_ROOM, isActive: true },
                { name: RoomName.STREAM_SAUNA, isActive: true },
            ];
            const newRooms = this.roomRepository.create(roomsToSeed);
            await this.roomRepository.save(newRooms);
        }
        else {
            console.log(`Found ${existingRoomsCount} rooms. Skipping seeding.`);
        }
    }
}

