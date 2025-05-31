import { Module } from '@nestjs/common';
import { MembershipServiceController } from './membership-service.controller';
import { MembershipServiceService } from './membership-service.service';

@Module({
  imports: [],
  controllers: [MembershipServiceController],
  providers: [MembershipServiceService],
})
export class MembershipServiceModule {}
