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

export type UserCreateFields = {
  login: string;
  password: string;
  email: string;
};

export type UserCreateType = {
  login: string;
  passwordHash: string;
  email: string;
  isConfirmed: boolean;
  confirmCode?: string | null;
};

export type CreatedUserResponse = { id: string; login: string };

export type RegisteredUserResponse = {
  id: string;
  login: string;
  email: string;
};

export type UserEntity = {
  id: IdType;
  login: string;
  passwordHash: string;
  email: string;
  isConfirmed: boolean;
  confirmCode?: string | null;
};
