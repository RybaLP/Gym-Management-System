import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './providers/membership.service';
import { MembershipProvider } from './providers/membership.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';

@Module({
    imports : [
        TypeOrmModule.forFeature([Membership])
    ],
    controllers : [MembershipController],
    providers: [MembershipService, MembershipProvider]
})
export class MembershipModule {}
