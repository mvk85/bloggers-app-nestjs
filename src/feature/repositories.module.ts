import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configEnvKeys } from 'src/config/consts';
import { Bloggers } from 'src/db/typeorm/entity/Bloggers';
import { CommentLikes } from 'src/db/typeorm/entity/CommentLikes';
import { Comments } from 'src/db/typeorm/entity/Comments';
import { PostLikes } from 'src/db/typeorm/entity/PostLikes';
import { Posts } from 'src/db/typeorm/entity/Posts';
import { Users } from 'src/db/typeorm/entity/Users';
import { DbType } from 'src/types';
import {
  bloggersMongoRepositoryProvider,
  bloggersPgRepositoryProvider,
  bloggersToRepositoryProvider,
  commentsMongoRepositoryProvider,
  commentsPgRepositoryProvider,
  commentsToRepositoryProvider,
  postsMongoRepositoryProvider,
  postsPgRepositoryProvider,
  postsToRepositoryProvider,
  usersMongoRepositoryProvider,
  usersPgRepositoryProvider,
  usersToRepositoryProvider,
} from './repositories';

const mongoRepositories: Provider[] = [
  bloggersMongoRepositoryProvider,
  postsMongoRepositoryProvider,
  usersMongoRepositoryProvider,
  commentsMongoRepositoryProvider,
];

const pgRepositories: Provider[] = [
  bloggersPgRepositoryProvider,
  postsPgRepositoryProvider,
  usersPgRepositoryProvider,
  commentsPgRepositoryProvider,
];

const toRepositories: Provider[] = [
  bloggersToRepositoryProvider,
  postsToRepositoryProvider,
  usersToRepositoryProvider,
  commentsToRepositoryProvider,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bloggers,
      Posts,
      Comments,
      CommentLikes,
      PostLikes,
      Users,
    ]),
  ],
})
export class RepositoriesModule {
  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const dbType = configService.get(configEnvKeys.dbType);
    let providers = mongoRepositories;
    const isSql = dbType === DbType.Sql;
    const isTypeorm = dbType === DbType.Typeorm;

    if (isSql) {
      providers = pgRepositories;
    }

    if (isTypeorm) {
      providers = toRepositories;
    }

    return {
      module: RepositoriesModule,
      providers: providers,
      exports: providers,
    };
  }
}
