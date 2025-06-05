import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BookingStatus } from "../enums/bookings.enum";

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({type : 'uuid', nullable : false})
    userId : string;

    @Column({type : 'uuid', nullable : false})
    membershipId : string | null;

    @Column({type : 'timestamp with time zone', nullable : false})
    startTime : Date;

    @Column({type : 'timestamp with time zone', nullable : false})
    endTime : Date;

    @Column({
        type : 'enum',
        enum : BookingStatus,
        default : BookingStatus.PENDING
    })
    status : BookingStatus

    @CreateDateColumn({type : 'timestamp with time zone'})
    createdAt : Date;

    @UpdateDateColumn({type : 'timestamp with time zone'})
    updatedAt : Date;

}
