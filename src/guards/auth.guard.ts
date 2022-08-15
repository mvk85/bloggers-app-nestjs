import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtUtility } from 'src/auth/jwt-utility';
import { IUsersRepository } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected jwtUtility: JwtUtility,
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
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

    req.user = {
      userId: user.id,
      userLogin: user.login,
    };

    return true;
  }
}
