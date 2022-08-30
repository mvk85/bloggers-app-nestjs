import { UserDbEntity } from 'src/db/types';
import { CreatedUserResponse, UserCreateType } from '../types';

export interface IUsersRepository {
  getUsers(skip: number, limit: number): Promise<UserDbEntity[]>;

  getCountUsers(): Promise<number>;

  createUser(newUser: UserCreateType): Promise<CreatedUserResponse>;

  deleteUserByid(id: string): Promise<boolean>;

  findUserByLogin(login: string): Promise<UserDbEntity | null>;

  findUserByLoginOrThrow(login: string): Promise<UserDbEntity | null>;

  findUserByEmail(email: string): Promise<UserDbEntity | null>;

  findUserByEmailOrThrow(email: string): Promise<UserDbEntity | null>;

  findUserByUserId(id: string): Promise<UserDbEntity | null>;

  findUserByConfirmationCode(code: string): Promise<UserDbEntity | null>;

  deleteAllUsers(): void;

  registrationConfirmed(id: string): Promise<boolean>;

  updateConfirmationCode(id: string, code: string): Promise<boolean>;
}
