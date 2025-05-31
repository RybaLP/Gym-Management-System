import { Controller, Get } from '@nestjs/common';
import { MembershipServiceService } from './membership-service.service';

@Controller()
export class MembershipServiceController {
  constructor(private readonly membershipServiceService: MembershipServiceService) {}

  @Get()
  getHello(): string {
    return this.membershipServiceService.getHello();
  }
}
