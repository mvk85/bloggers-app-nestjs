import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtUtility } from 'src/auth/jwt-utility';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';

@Injectable()
export class InjectUserIdFromJwt implements CanActivate {
  constructor(
    protected jwtUtility: JwtUtility,
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    // const token = req.cookies && req.cookies.refreshToken;

    // if (!token) {
    //   return true;
    // }

    // const userId = await this.jwtUtility.getUserIdByToken(token, true);

    // if (!userId) {
    //   return true;
    // }

    // const user = await this.usersRepository.findUserByUserId(userId);

    // if (!user) {
    //   return true;
    // }

    if (!req.headers.authorization) {
      return true;
    }

    const token = req.headers.authorization.split(' ')[1];

    const userId = await this.jwtUtility.getUserIdByToken(token);

    if (!userId) {
      return true;
    }

    const user = await this.usersRepository.findUserByUserId(userId);

    if (!user) {
      return true;
    }

    req.user = { userId: user.id };

    return true;
  }
}
