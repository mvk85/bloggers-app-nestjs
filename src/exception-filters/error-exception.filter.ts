import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.NODE_ENV !== 'production') {
      response.status(500).send({
        error: exception.toString(),
        stack: exception.stack,
      });
    } else {
      response.status(500).send('Some error occured');
    }
  }
}
