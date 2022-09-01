import { BloggerEntity } from './feature/bloggers/types';

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
  items: BloggerEntity[];
};

export enum RepositoryProviderKeys {
  bloggers = 'bloggersRepositoryProvider',
  posts = 'postsRepositoryProvider',
  comments = 'commentsRepositoryProvider',
  users = 'usersRepositoryProvider',
}
