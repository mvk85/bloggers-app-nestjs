import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      if (!Array.isArray(responseBody.message)) {
        response.status(status).send(responseBody.message);

        return;
      }

      responseBody.message.forEach((e) => errorResponse.errorsMessages.push(e));

      response.status(status).send(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        messageError: exception.message,
      });
    }
  }
}
