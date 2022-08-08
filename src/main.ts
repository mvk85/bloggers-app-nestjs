import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { configEnvKeys } from './config/consts';
import { DbRunner } from './db/db-runner';
import { ErrorExceptionFilter } from './exception-filters/error-exception.filter';
import { HttpExceptionFilter } from './exception-filters/http-exception.filter';

const validationPipeOption = {
  stopAtFirstError: true,
  exceptionFactory: (errors) => {
    const errorsForResponse = [];

    errors.forEach((e) => {
      const constraintsKeys = Object.keys(e.constraints);

      constraintsKeys.forEach((ckey) => {
        errorsForResponse.push({
          field: e.property,
          message: e.constraints[ckey],
        });
      });
    });
    throw new BadRequestException(errorsForResponse);
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dbRunner = app.get(DbRunner);

  await dbRunner.runDb();

  const configService = app.get(AppConfigService);
  const port = configService.getEnv(configEnvKeys.port);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validationPipeOption));
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(port);
  console.log(`Server was started on port: ${port}`);
}

bootstrap();
