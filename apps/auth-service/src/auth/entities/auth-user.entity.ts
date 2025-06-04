import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../enums/user-role.enum";

@Entity('auth-users')
export class AuthUser{
    @PrimaryGeneratedColumn('uuid')
    id : string 

    @Column({unique : true})
    email : string 

    @Column({select : false})
    password : string; 

    @Column({
        type : 'enum',
        enum : UserRole,
        default : UserRole.CLIENT
    })
    role : UserRole

    @Column({ default: true }) // Dodałem wcześniej, jest przydatne
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}