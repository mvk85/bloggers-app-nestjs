import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDbEntity } from 'src/db/types';
import { CreateUserFields } from 'src/feature/users/types';
import { UsersService } from 'src/feature/users/users.service';
import { AuthRepository } from './auth.repository';
import { EmailManager } from './email-manager';
import { JwtUtility } from './jwt-utility';
import { MeItem } from './types';

@Injectable()
export class AuthService {
  constructor(
    protected usersService: UsersService,
    protected emailManager: EmailManager,
    public jwtUtility: JwtUtility,
    protected authRepository: AuthRepository,
  ) {}

  async getUserByCredentials(
    login: string,
    password: string,
  ): Promise<UserDbEntity | null> {
    const user = await this.usersService.getUserByLogin(login);

    if (!user) return null;

    const resultCompare = await bcrypt.compare(password, user.passwordHash);

    return resultCompare ? user : null;
  }

  async registration(createUserFields: CreateUserFields): Promise<boolean> {
    const createdUser = await this.usersService.makeRegisteredUser(
      createUserFields,
    );

    if (!createdUser) return false;

    // this need to get confirmCode for email message
    const user = await this.usersService.getUserById(createdUser.id);

    if (!user) return false;

    const isSended = await this.emailManager.sendRegistrationCode(user);

    return isSended;
  }

  async registrationConfirmation(code: string) {
    const user = await this.usersService.getUserByConfirmationCode(code);

    if (!user) return false;

    const savedIsConfirmed = await this.usersService.registrationConfirmed(
      user.id,
    );

    return savedIsConfirmed;
  }

  async registrationEmailResending(email: string) {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) return false;

    const isUpdatedConfirmationCode =
      this.usersService.updateConfirmationCode(user);

    if (!isUpdatedConfirmationCode) return false;

    const updatedUser = await this.usersService.getUserById(user.id);

    if (!updatedUser) return false;

    const isSended = await this.emailManager.sendRegistrationCode(updatedUser);

    return isSended;
  }

  createTokensByUserId(userId: string) {
    return this.jwtUtility.createJWTTokens(userId);
  }

  createTokensByRefreshToken(refreshToken: string) {
    const userId = this.jwtUtility.getUserIdByToken(refreshToken, true);

    return this.jwtUtility.createJWTTokens(userId);
  }

  async canRefreshedTokens(refreshToken: string): Promise<boolean> {
    const isValidRefreshToken = this.jwtUtility.checkRefreshToken(refreshToken);

    if (!isValidRefreshToken) {
      return false;
    }

    const isBadRefreshToken = await this.authRepository.isBadRefreshToken(
      refreshToken,
    );

    return !isBadRefreshToken;
  }

  async addTokenToBlackList(refreshToken: string) {
    const userId = this.jwtUtility.getUserIdByToken(refreshToken, true);
    const result = await this.authRepository.addToBadRefreshTokens(
      userId,
      refreshToken,
    );

    return !!result;
  }

  async me(userId: string): Promise<MeItem | null> {
    const user = await this.usersService.getUserById(userId);

    if (!user) return null;

    const meItem = new MeItem(user.email, user.login, user.id);

    return meItem;
  }
}
