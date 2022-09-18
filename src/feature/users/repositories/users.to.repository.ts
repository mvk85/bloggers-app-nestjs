import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/db/typeorm/entity/Users';
import { UserDbEntity } from 'src/db/types';
import { Repository } from 'typeorm';
import { UserCreateType, CreatedUserResponse, UserEntity } from '../types';
import { IUsersRepository } from './IUsersRepository';

export class UsersToRepository implements IUsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly usersTypeormRepository: Repository<Users>,
  ) {}

  getUsers(skip: number, limit: number): Promise<UserDbEntity[]> {
    throw new Error('Method not implemented.');
  }

  getCountUsers(): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async createUser(userCreate: UserCreateType): Promise<CreatedUserResponse> {
    const newUser = new Users();
    newUser.confirmCode = userCreate.confirmCode;
    newUser.email = userCreate.email;
    newUser.isConfirmed = userCreate.isConfirmed;
    newUser.login = userCreate.login;
    newUser.passwordHash = userCreate.passwordHash;

    const createdUser = await this.usersTypeormRepository.save(newUser);

    return {
      id: createdUser.id,
      login: createdUser.login,
    };
  }

  deleteUserByid(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  findUserByLogin(login: string): Promise<UserEntity> {
    return this.usersTypeormRepository.findOneBy({ login });
  }

  findUserByLoginOrThrow(login: string): Promise<UserEntity> {
    const user = this.findUserByLogin(login);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  findUserByEmail(email: string): Promise<UserEntity> {
    return this.usersTypeormRepository.findOneBy({ email });
  }

  findUserByEmailOrThrow(email: string): Promise<UserEntity> {
    const user = this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  findUserByUserId(id: string): Promise<UserEntity> {
    return this.usersTypeormRepository.findOneBy({ id });
  }

  findUserByConfirmationCode(code: string): Promise<UserEntity> {
    return this.usersTypeormRepository.findOneBy({ confirmCode: code });
  }

  async deleteAllUsers(): Promise<void> {
    await this.usersTypeormRepository.delete({});
  }

  registrationConfirmed(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  updateConfirmationCode(id: string, code: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
