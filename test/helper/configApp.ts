import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { ErrorExceptionFilter } from 'src/exception-filters/error-exception.filter';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { validationPipeOption } from 'src/pipes/validation-pipe.options';

export const configTestApp = (app: INestApplication) => {
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validationPipeOption));
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};
