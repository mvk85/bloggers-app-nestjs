import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { projectionUserItem } from 'src/const';
import { MongooseModelNamed } from 'src/db/mongodb/const';
import { UsersModel } from 'src/db/mongodb/models.mongoose';
import { UserDbEntity } from 'src/db/types';
import { generateCustomId } from 'src/utils';
import { CreatedUserResponse, UserCreateType, UserEntity } from '../types';
import { IUsersRepository } from './IUsersRepository';

@Injectable()
export class UsersMongoRepository implements IUsersRepository {
  constructor(
    @Inject(MongooseModelNamed.UsersMongooseModel)
    private usersModel: typeof UsersModel,
  ) {}

  async getUsers(skip: number, limit: number): Promise<UserDbEntity[]> {
    const users = await this.usersModel
      .find({})
      .select(projectionUserItem)
      .skip(skip)
      .limit(limit)
      .lean();

    return users;
  }

  async getCountUsers(): Promise<number> {
    const count = await this.usersModel.count({});

    return count;
  }

  async createUser(user: UserCreateType): Promise<CreatedUserResponse> {
    const newUser = new UserDbEntity(
      new ObjectId(),
      generateCustomId(),
      user.login,
      user.passwordHash,
      user.email,
      user.isConfirmed,
      user.confirmCode,
    );
    await this.usersModel.create(newUser);

    return { id: newUser.id, login: user.login };
  }

  async deleteUserByid(id: string): Promise<boolean> {
    const result = await this.usersModel.deleteOne({ id });

    return result.deletedCount === 1;
  }

  async findUserByLogin(login: string): Promise<UserEntity | null> {
    const user = await this.usersModel.findOne({ login });

    return user;
  }

  async findUserByLoginOrThrow(login: string): Promise<UserEntity | null> {
    const user = this.findUserByLogin(login);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.usersModel.findOne({ email });

    return user;
  }

  async findUserByEmailOrThrow(email: string): Promise<UserEntity | null> {
    const user = this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserByUserId(id: string): Promise<UserDbEntity | null> {
    const user = await this.usersModel.findOne({ id });

    return user;
  }

  async findUserByConfirmationCode(code: string): Promise<UserDbEntity | null> {
    const user = await this.usersModel.findOne({ confirmCode: code });

    return user;
  }

  async deleteAllUsers() {
    await this.usersModel.deleteMany({});
  }

  async registrationConfirmed(id: string): Promise<boolean> {
    const resultUpdating = await this.usersModel.updateOne(
      { id },
      { $set: { isConfirmed: true } },
    );

    return resultUpdating.matchedCount === 1;
  }

  async updateConfirmationCode(id: string, code: string): Promise<boolean> {
    const resultUpdating = await this.usersModel.updateOne(
      { id },
      { $set: { confirmCode: code } },
    );

    return resultUpdating.matchedCount === 1;
  }
}
