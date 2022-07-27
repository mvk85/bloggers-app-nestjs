import { Global, Module } from '@nestjs/common';
import { MongooseModelNamed } from './const';
import {
  BadRefreshTokensModel,
  BloggersModel,
  CommentsModel,
  PostsModel,
  RequestsModel,
  UsersModel,
} from './models.mongoose';
import { DbRunner } from './db-runner';

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
    provide: MongooseModelNamed.RequestsMongooseModel,
    useValue: RequestsModel,
  },
  {
    provide: MongooseModelNamed.BadRefreshTokensMongooseModel,
    useValue: BadRefreshTokensModel,
  },
];

@Global()
@Module({
  providers: [...mongooseModelProviders, DbRunner],
  exports: [...mongooseModelProviders, DbRunner],
})
export class DbModule {}
