import { Provider } from '@nestjs/common';
import { RepositoryProviderKeys } from 'src/types';
import { BloggersPgRepository } from './bloggers/bloggers.pg.repository';
import { BloggersMongoRepository } from './bloggers/bloggers.mongo.repository';
import { PostsMongoRepository } from './posts/posts.mongo.repository';
import { PostsPgRepository } from './posts/posts.pg.repository';
import { UsersPgRepository } from './users/users.pg.repository';
import { UsersMongoRepository } from './users/users.mongo.repository';

export const bloggersMongoRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.bloggers,
  useClass: BloggersMongoRepository,
};

export const postsMongoRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.posts,
  useClass: PostsMongoRepository,
};

export const usersMongoRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.users,
  useClass: UsersMongoRepository,
};

export const bloggersPgRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.bloggers,
  useClass: BloggersPgRepository,
};

export const postsPgRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.posts,
  useClass: PostsPgRepository,
};

export const usersPgRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.users,
  useClass: UsersPgRepository,
};
