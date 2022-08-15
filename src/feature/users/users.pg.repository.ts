import { NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserDbEntity } from 'src/db/types';
import { DataSource } from 'typeorm';
import { IUsersRepository } from './types';

export class UsersPgRepository implements IUsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getUsers(skip: number, limit: number): Promise<UserDbEntity[]> {
    const result = await this.dataSource.query(
      `
      select "id", "login", "email" 
      from "Users" 
      limit $1 
      offset $2
      `,
      [limit, skip],
    );

    return result;
  }

  async getCountUsers(): Promise<number> {
    const result = await this.dataSource.query(
      `
      select count(*) from "Users"
      `,
    );
    return result[0].count;
  }

  async createUser(newUser: UserDbEntity): Promise<string> {
    const result = await this.dataSource.query(
      `
      insert into "Users"
      ("passwordHash", "isConfirmed", "confirmCode", "login", "email")
      values ($1, $2, $3, $4, $5)
      returning "id";
      `,
      [
        newUser.passwordHash,
        newUser.isConfirmed,
        newUser.confirmCode,
        newUser.login,
        newUser.email,
      ],
    );

    return result[0].id;
  }

  async getCreatedUserById(userId: string): Promise<UserDbEntity> {
    const result = await this.dataSource.query(
      `
      select "id", "login"
      from "Users"  
      where "id" = $1
    `,
      [userId],
    );

    return result[0];
  }

  // TODO modify returned type in this class
  async getRegisteredUser(userId: string): Promise<UserDbEntity> {
    const result = await this.dataSource.query(
      `
      select "id", "login", "email" 
      from "Users"  
      where "id" = $1
    `,
      [userId],
    );

    return result[0];
  }

  async deleteUserByid(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "Users" WHERE "id" = $1;
    `,
      [id],
    );

    return !!result[1];
  }

  async findUserByLogin(login: string): Promise<UserDbEntity> {
    const result = await this.dataSource.query(
      `
        select "passwordHash", "isConfirmed", "confirmCode", "login", "email", "id"
        from "Users" u
        where u.login = $1
      `,
      [login],
    );

    return result[0];
  }

  async findUserByLoginOrThrow(login: string): Promise<UserDbEntity> {
    const user = this.findUserByLogin(login);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<UserDbEntity> {
    const result = await this.dataSource.query(
      `
        select "passwordHash", "isConfirmed", "confirmCode", "login", "email", "id"
        from "Users" u
        where u.email = $1
      `,
      [email],
    );

    return result[0];
  }

  async findUserByEmailOrThrow(email: string): Promise<UserDbEntity> {
    const user = this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserByUserId(id: string): Promise<UserDbEntity> {
    const result = await this.dataSource.query(
      `
        select "passwordHash", "isConfirmed", "confirmCode", "login", "email", "id"
        from "Users" u
        where u.id = $1
      `,
      [id],
    );

    return result[0];
  }

  async findUserByConfirmationCode(code: string): Promise<UserDbEntity> {
    const result = await this.dataSource.query(
      `
        select "passwordHash", "isConfirmed", "confirmCode", "login", "email", "id"
        from "Users" u
        where u.confirmCode = $1
      `,
      [code],
    );

    return result[0];
  }

  async deleteAllUsers(): Promise<void> {
    await this.dataSource.query(
      `
      delete from "Users"
      `,
    );
  }

  async registrationConfirmed(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update "Users" u set "isConfirmed" = true
      where u.id = $1
      `,
      [id],
    );

    return !!result[1];
  }

  async updateConfirmationCode(id: string, code: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update "Users" u set "confirmCode" = $1
      where u.id = $2
      `,
      [code, id],
    );

    return !!result[1];
  }
}
