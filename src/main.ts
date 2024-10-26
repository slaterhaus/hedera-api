/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { configDotenv } from 'dotenv';

configDotenv()
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: ["/"]
  });
  app.enableCors({
    origin: [
      'http://localhost:3000',
      '/^https:\\/\\/hedera.*\\.vercel\\.app$/'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
