import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/db/typeorm/entity/Users';
import { Repository } from 'typeorm';
import { UserCreateType, CreatedUserResponse, UserEntity } from '../types';
import { IUsersRepository } from './IUsersRepository';

export class UsersToRepository implements IUsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly usersTypeormRepository: Repository<Users>,
  ) {}

  getUsers(skip: number, limit: number): Promise<UserEntity[]> {
    return this.usersTypeormRepository
      .createQueryBuilder('users')
      .select('users.id', 'id')
      .addSelect('users.login', 'login')
      .skip(skip)
      .take(limit)
      .getRawMany();
  }

  getCountUsers(): Promise<number> {
    return this.usersTypeormRepository.count();
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

  async deleteUserByid(id: string): Promise<boolean> {
    const result = await this.usersTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
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

  async registrationConfirmed(id: string): Promise<boolean> {
    const result = await this.usersTypeormRepository
      .createQueryBuilder()
      .update()
      .set({ isConfirmed: true })
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async updateConfirmationCode(id: string, code: string): Promise<boolean> {
    const result = await this.usersTypeormRepository
      .createQueryBuilder()
      .update()
      .set({ confirmCode: code })
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }
}
