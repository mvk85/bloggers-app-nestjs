import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configEnvKeys } from 'src/config/consts';
import {
  bloggersMongoRepositoryProvider,
  bloggersPgRepositoryProvider,
  postsMongoRepositoryProvider,
  postsPgRepositoryProvider,
  usersMongoRepositoryProvider,
  usersPgRepositoryProvider,
} from './repositories';

const mongoRepositories: Provider[] = [
  bloggersMongoRepositoryProvider,
  postsMongoRepositoryProvider,
  usersMongoRepositoryProvider,
];

const pgRepositories: Provider[] = [
  bloggersPgRepositoryProvider,
  postsPgRepositoryProvider,
  usersPgRepositoryProvider,
];

@Module({})
export class RepositoriesModule {
  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const dbType = configService.get(configEnvKeys.dbType);
    const isPostgres = dbType === 'postgres';
    const providers = isPostgres ? pgRepositories : mongoRepositories;

    return {
      module: RepositoriesModule,
      providers: providers,
      exports: providers,
    };
  }
}
