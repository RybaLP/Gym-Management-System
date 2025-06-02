import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('client')
export class Client {
    @PrimaryGeneratedColumn()
    id : number

    @Column(
        {unique : true, length : 30}
    )
    login : string

    @Column()
    password : string

    @Column({unique : true})
    email : string

    @Column({length : 30})
    firstName : string

    @Column({length : 30})
    lastName : string

    @Column({nullable : true})
    phone : string;

    @Column({default : true})
    isActive : boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Data utworzenia rekordu
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }) // Data ostatniej aktualizacji
    updatedAt: Date;
}