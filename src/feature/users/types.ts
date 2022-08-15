import { IdType, UserDbEntity } from 'src/db/types';
import { PaginationData } from 'src/types';

export type CreatedUserType = {
  id: IdType;
  login: string;
  email: string;
};

export type ResponseUsers = PaginationData & {
  items: UserDbEntity[];
};

export type CreateUserFields = {
  login: string;
  password: string;
  email: string;
};

export interface IUsersRepository {
  getUsers(skip: number, limit: number): Promise<UserDbEntity[]>;

  getCountUsers(): Promise<number>;

  createUser(newUser: UserDbEntity): Promise<string>;

  getCreatedUserById(userId: string): Promise<UserDbEntity>;

  getRegisteredUser(userId: string): Promise<UserDbEntity>;

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
