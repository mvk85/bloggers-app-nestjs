import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUtility } from 'src/auth/jwt-utility';
import { UsersRepository } from 'src/feature/users/users.repository';

// TODO узнать, нормально ли так делать (делается только подмешинвание, без прерывания)
@Injectable()
export class InjectUserIdFromJwt implements CanActivate {
  constructor(
    protected jwtUtility: JwtUtility,
    protected usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

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
