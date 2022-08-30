import { Inject, Injectable } from '@nestjs/common';
import { UserDbEntity } from 'src/db/types';
import { PaginationParams, RepositoryProviderKeys } from 'src/types';
import {
  generateConfirmCode,
  generateHash,
  generatePaginationData,
} from 'src/utils';
import { IUsersRepository } from './repositories/IUsersRepository';
import {
  UserCreateFields,
  ResponseUsers,
  UserCreateType,
  CreatedUserResponse,
  RegisteredUserResponse,
} from './types';

@Injectable()
export class UsersService {
  constructor(
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async getUsers(paginationParams: PaginationParams): Promise<ResponseUsers> {
    const usersCount = await this.usersRepository.getCountUsers();
    const { skip, pageSize, pagesCount, pageNumber } = generatePaginationData(
      paginationParams,
      usersCount,
    );

    const users = await this.usersRepository.getUsers(skip, pageSize);

    return {
      items: users,
      pagesCount,
      pageSize,
      totalCount: usersCount,
      page: pageNumber,
    };
  }

  async getUserById(id: string): Promise<UserDbEntity | null> {
    return this.usersRepository.findUserByUserId(id);
  }

  async getUserByLogin(login: string): Promise<UserDbEntity | null> {
    return this.usersRepository.findUserByLogin(login);
  }

  async getUserByEmail(email: string): Promise<UserDbEntity | null> {
    return this.usersRepository.findUserByEmail(email);
  }

  async getUserByConfirmationCode(code: string): Promise<UserDbEntity | null> {
    return this.usersRepository.findUserByConfirmationCode(code);
  }

  async registrationConfirmed(id: string): Promise<boolean> {
    return this.usersRepository.registrationConfirmed(id);
  }

  async addUser(fields: UserCreateFields): Promise<CreatedUserResponse> {
    const passwordHash = await generateHash(fields.password);
    const newUser: UserCreateType = {
      login: fields.login,
      passwordHash: passwordHash,
      email: fields.email,
      isConfirmed: true,
    };

    const createdUser = await this.usersRepository.createUser(newUser);

    return createdUser;
  }

  async makeRegisteredUser(
    fields: UserCreateFields,
  ): Promise<RegisteredUserResponse> {
    const passwordHash = await generateHash(fields.password);
    const newUser: UserCreateType = {
      login: fields.login,
      passwordHash: passwordHash,
      email: fields.email,
      isConfirmed: false,
      confirmCode: generateConfirmCode(),
    };

    const createdUser = await this.usersRepository.createUser(newUser);

    return { ...createdUser, email: fields.email };
  }

  async deleteUserById(id: string) {
    const isDeleted = await this.usersRepository.deleteUserByid(id);

    return isDeleted;
  }

  async updateConfirmationCode(user: UserDbEntity) {
    const newCode = generateConfirmCode();
    const isUpdated = await this.usersRepository.updateConfirmationCode(
      user.id,
      newCode,
    );

    return isUpdated;
  }
}
