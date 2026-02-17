import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Stripe webhooks need raw body — use verify callback to store it
    rawBody: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
