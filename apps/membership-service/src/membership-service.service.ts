import { Injectable } from '@nestjs/common';

@Injectable()
export class MembershipServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
