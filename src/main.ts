import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { runDb } from './db/runDd';

async function bootstrap() {
  await runDb();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
