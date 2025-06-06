import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoomName } from "../enums/room.enum";

@Entity('rooms')
export class Room{
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({ type: 'enum', enum: RoomName, nullable: false })
  name: RoomName; 
  
  @Column({ type: 'boolean', default: true })
  isActive: boolean; 

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}