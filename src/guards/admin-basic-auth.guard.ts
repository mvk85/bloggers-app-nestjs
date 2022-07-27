import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

const logopass = 'admin:qwerty';
const logopassBase64 = Buffer.from(logopass).toString('base64');

@Injectable()
export class AdminBasicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const headers = req.headers;
    const authHeaderString = headers.authorization;
    const [authType, authHeader] = authHeaderString?.split(' ') || [];

    if (authHeader === logopassBase64 && authType === 'Basic') {
      return true;
    }

    throw new UnauthorizedException();
  }
}
