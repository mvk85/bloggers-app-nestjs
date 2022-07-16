import { Module } from '@nestjs/common';
import { MongooseModelNamed } from './const';
import {
  BadRefreshTokensModel,
  BloggersModel,
  CommentsModel,
  PostsModel,
  RequestsModel,
  UsersModel,
} from './models.mongoose';

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

@Module({
  providers: mongooseModelProviders,
  exports: mongooseModelProviders,
})
export class DbModule {}
