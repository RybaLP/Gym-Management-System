import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('memberships')
export class Membership{
    @PrimaryGeneratedColumn()
    id : number

    @Column({unique : true, length : 100})
    name : string

    @Column({type : 'text', nullable : true})
    description : string

    @Column({ type: 'decimal', precision: 10, scale: 2 }) 
    price: number;

    @Column({default : 0 })
    durationDays : number;

    @Column({default : true})
    isActive : boolean

}