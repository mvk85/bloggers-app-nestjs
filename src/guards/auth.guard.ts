import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtUtility } from 'src/auth/jwt-utility';
import { UsersRepository } from 'src/feature/users/users.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected jwtUtility: JwtUtility,
    protected usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }

    const token = req.headers.authorization.split(' ')[1];

    const userId = await this.jwtUtility.getUserIdByToken(token);

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.usersRepository.findUserByUserId(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    // TODO сделать типизацию
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = {
      userId: user.id,
      userLogin: user.login,
    };

    return true;
  }
}