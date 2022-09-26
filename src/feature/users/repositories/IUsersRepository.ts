import { CreatedUserResponse, UserCreateType, UserEntity } from '../types';

export interface IUsersRepository {
  getUsers(skip: number, limit: number): Promise<CreatedUserResponse[]>;

  getCountUsers(): Promise<number>;

  createUser(newUser: UserCreateType): Promise<CreatedUserResponse>;

  deleteUserByid(id: string): Promise<boolean>;

  findUserByLogin(login: string): Promise<UserEntity | null>;

  findUserByLoginOrThrow(login: string): Promise<UserEntity | null>;

  findUserByEmail(email: string): Promise<UserEntity | null>;

  findUserByEmailOrThrow(email: string): Promise<UserEntity | null>;

  findUserByUserId(id: string): Promise<UserEntity | null>;

  findUserByConfirmationCode(code: string): Promise<UserEntity | null>;

  deleteAllUsers(): void;

  registrationConfirmed(id: string): Promise<boolean>;

  updateConfirmationCode(id: string, code: string): Promise<boolean>;
}
