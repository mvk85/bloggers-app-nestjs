import { Blogger } from './db/types';

export type PaginationParams = {
  PageNumber?: string;
  PageSize?: string;
};

export type PaginationData = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};

export type ResponseBloggers = PaginationData & {
  items: Blogger[];
};

export type UserGuardEntity = {
  userId: string;
  userLogin: string;
};
