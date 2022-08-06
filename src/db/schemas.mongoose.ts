import mongoose from 'mongoose';
import {
  BloggerDbEntity,
  BruteForceItem,
  CommentDbEntity,
  PostDbEntity,
  BadRefreshTokenEntityType,
  UserDbEntity,
} from './types';

export const bloggersSchema = new mongoose.Schema<BloggerDbEntity>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
});

export const usersSchema = new mongoose.Schema<UserDbEntity>({
  passwordHash: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true },
  confirmCode: { type: String, default: null },
  id: { type: String, required: true },
  login: { type: String, required: true },
  email: { type: String, required: true },
});

export const postsSchema = new mongoose.Schema<PostDbEntity>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  bloggerId: { type: String, required: true },
  bloggerName: { type: String, required: true },
  addedAt: { type: Date, requered: true },
  // TODO maybe use sub-schema will be better for likes?
  likes: {
    data: [
      {
        addedAt: { type: Date, required: true },
        userId: { type: String, required: true },
        login: { type: String, required: true },
        likeStatus: {
          type: String,
          enum: ['Like', 'Dislike'],
          required: true,
        },
      },
    ],
  },
});

export const commentsSchema = new mongoose.Schema<CommentDbEntity>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
  addedAt: { type: String, required: true },
  postId: { type: String, required: true },
  likes: {
    data: [
      {
        addedAt: { type: Date, required: true },
        userId: { type: String, required: true },
        likeStatus: {
          type: String,
          enum: ['Like', 'Dislike'],
          required: true,
        },
      },
    ],
  },
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
