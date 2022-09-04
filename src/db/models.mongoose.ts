import mongoose from 'mongoose';
import {
  bloggersSchema,
  commentsSchema,
  postsSchema,
  badRefreshTokensSchema,
  usersSchema,
} from './schemas.mongoose';

const bloggersModelName = 'bloggers';
const usersModelName = 'users';
const postsModelName = 'posts';
const commentsModelName = 'comments';
const badRefreshTokensName = 'badRefreshTokens';

export const BloggersModel = mongoose.model(bloggersModelName, bloggersSchema);
export const UsersModel = mongoose.model(usersModelName, usersSchema);
export const PostsModel = mongoose.model(postsModelName, postsSchema);
export const CommentsModel = mongoose.model(commentsModelName, commentsSchema);
export const BadRefreshTokensModel = mongoose.model(
  badRefreshTokensName,
  badRefreshTokensSchema,
);
