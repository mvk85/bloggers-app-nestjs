import { Global, Module } from '@nestjs/common';
import { MongooseModelNamed } from './const';
import {
  BadRefreshTokensModel,
  BloggersModel,
  CommentsModel,
  PostsModel,
  UsersModel,
} from './models.mongoose';
import { MongodbRunner } from './mongodb-runner';

const mongooseModelProviders = [
  {
    provide: MongooseModelNamed.BloggersMongooseModel,
    useValue: BloggersModel,
  },
  {
    provide: MongooseModelNamed.UsersMongooseModel,
    useValue: UsersModel,
  },
  {
    provide: MongooseModelNamed.PostsMongooseModel,
    useValue: PostsModel,
  },
  {
    provide: MongooseModelNamed.CommentsMongooseModel,
    useValue: CommentsModel,
  },
  {
    provide: MongooseModelNamed.BadRefreshTokensMongooseModel,
    useValue: BadRefreshTokensModel,
  },
];

@Global()
@Module({
  providers: [...mongooseModelProviders, MongodbRunner],
  exports: [...mongooseModelProviders, MongodbRunner],
})
export class MongoDbModule {}
