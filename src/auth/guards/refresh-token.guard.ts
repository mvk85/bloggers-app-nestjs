import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

// TODO нормальная ли это реализация проверки refresh токена?
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const canUpdated = await this.authService.canRefreshedTokens(refreshToken);

    if (!canUpdated) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
