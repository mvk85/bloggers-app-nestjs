import { Provider } from '@nestjs/common';
import { RepositoryProviderKeys } from 'src/types';
import { BloggersPgRepository } from './bloggers/repositories/bloggers.pg.repository';
import { BloggersMongoRepository } from './bloggers/repositories/bloggers.mongo.repository';
import { PostsMongoRepository } from './posts/repositories/posts.mongo.repository';
import { UsersPgRepository } from './users/repositories/users.pg.repository';
import { UsersMongoRepository } from './users/repositories/users.mongo.repository';
import { PostsPgRepository } from './posts/repositories/posts.pg.repository';
import { CommentsMongoRepository } from './comments/repositories/comments.mongo.repository';
import { CommentsPgRepository } from './comments/repositories/comments.pg.repository';
import { BloggersToRepository } from './bloggers/repositories/bloggers.to.repository';
import { PostsToRepository } from './posts/repositories/posts.to.repository';
import { UsersToRepository } from './users/repositories/users.to.repository';
import { CommentsToRepository } from './comments/repositories/comments.to.repository';

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

export const commentsMongoRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.comments,
  useClass: CommentsMongoRepository,
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

export const commentsPgRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.comments,
  useClass: CommentsPgRepository,
};

export const bloggersToRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.bloggers,
  useClass: BloggersToRepository,
};

export const postsToRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.posts,
  useClass: PostsToRepository,
};

export const usersToRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.users,
  useClass: UsersToRepository,
};

export const commentsToRepositoryProvider: Provider = {
  provide: RepositoryProviderKeys.comments,
  useClass: CommentsToRepository,
};
