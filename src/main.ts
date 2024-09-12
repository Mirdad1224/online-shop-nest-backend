import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { corsOptions } from './config/corsOptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(corsOptions);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 5000);

  await app.listen(port);
  Logger.log(`~ Application is running on: ${await app.getUrl()}`);
}
bootstrap();
