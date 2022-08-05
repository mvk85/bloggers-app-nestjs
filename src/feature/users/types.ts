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
