import { NestFactory } from '@nestjs/core';
import { MembershipServiceModule } from './membership-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MembershipServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
