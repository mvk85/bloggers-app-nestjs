import mongoose from 'mongoose';
import {
  Blogger,
  BruteForceItem,
  Comment,
  Post,
  BadRefreshTokenEntityType,
  User,
} from './types';

export const bloggersSchema = new mongoose.Schema<Blogger>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
});

export const usersSchema = new mongoose.Schema<User>({
  passwordHash: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true },
  confirmCode: { type: String, default: null },
  id: { type: String, required: true },
  login: { type: String, required: true },
  email: { type: String, required: true },
});

export const postsSchema = new mongoose.Schema<Post>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  bloggerId: { type: String, required: true },
  bloggerName: { type: String, required: true },
});

export const commentsSchema = new mongoose.Schema<Comment>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
  addedAt: { type: String, required: true },
  postId: { type: String, required: true },
});

export const requestsSchema = new mongoose.Schema<BruteForceItem>({
  ip: { type: String, required: true },
  date: { type: Number, required: true },
  endpoint: { type: String, required: true },
});

export const badRefreshTokensSchema =
  new mongoose.Schema<BadRefreshTokenEntityType>({
    userId: { type: String, required: true },
    tokens: { type: [String], default: [] },
  });
