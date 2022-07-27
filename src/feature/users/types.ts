import { IdType, User } from 'src/db/types';
import { PaginationData } from 'src/types';

export type CreatedUserType = {
  id: IdType;
  login: string;
  email: string;
};

export type ResponseUsers = PaginationData & {
  items: User[];
};

export type CreateUserFields = {
  login: string;
  password: string;
  email: string;
};
