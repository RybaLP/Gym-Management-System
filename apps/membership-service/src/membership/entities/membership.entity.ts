import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MembershipType } from "../enums/membership.enum";


@Entity('memberships')
export class Membership{
    @PrimaryGeneratedColumn('uuid')
    id : string

    @Column({ type: 'uuid', nullable: false, unique: true }) 
    clientId: string; 

    @Column({ type: 'timestamp with time zone', nullable: false })
    startDate: Date;

    @Column({ type: 'timestamp with time zone', nullable: false })
    endDate: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({type : 'enum', enum : MembershipType , nullable : false , default : MembershipType.STANDARD})
    type: MembershipType;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}