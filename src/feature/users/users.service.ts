import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserDbEntity } from 'src/db/types';
import { PaginationParams, RepositoryProviderKeys } from 'src/types';
import {
  generateConfirmCode,
  generateCustomId,
  generateHash,
  generatePaginationData,
} from 'src/utils';
import { CreateUserFields, IUsersRepository, ResponseUsers } from './types';

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

  async addUser(fields: CreateUserFields) {
    const passwordHash = await generateHash(fields.password);
    const newUser = new UserDbEntity(
      new ObjectId(),
      generateCustomId(),
      fields.login,
      passwordHash,
      fields.email,
      true,
    );

    const createdUserId = await this.usersRepository.createUser(newUser);
    const createdUser = await this.usersRepository.getCreatedUserById(
      createdUserId,
    );

    return createdUser;
  }

  async makeRegisteredUser(fields: CreateUserFields) {
    const passwordHash = await generateHash(fields.password);
    const newUser = new UserDbEntity(
      new ObjectId(),
      generateCustomId(),
      fields.login,
      passwordHash,
      fields.email,
      false,
      generateConfirmCode(),
    );

    const registeredUserId = await this.usersRepository.createUser(newUser);
    const registeredUser = await this.usersRepository.getRegisteredUser(
      registeredUserId,
    );

    return registeredUser;
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
