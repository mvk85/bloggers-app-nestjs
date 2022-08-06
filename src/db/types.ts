import { ObjectId, WithId } from 'mongodb';

export type IdType = string;

export interface ILikeDbData {
  userId: string;
  likeStatus: LikeItemType;
}

export enum LikesStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum LikeItemType {
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikePostDbType = ILikeDbData &
  WithId<{
    addedAt: Date;
    login: string;
  }>;

export type LikeCommentDbType = ILikeDbData &
  WithId<{
    addedAt: Date;
  }>;

export type LikesPostDbType = {
  data: LikePostDbType[];
};

export type LikesCommentDbType = {
  data: LikeCommentDbType[];
};

export class BloggerDbEntity {
  constructor(
    public _id: ObjectId,
    public id: IdType,
    public name: string,
    public youtubeUrl: string,
  ) {}
}

export class PostDbEntity {
  constructor(
    public _id: ObjectId,
    public id: IdType,
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
    public bloggerName: string,
    public addedAt: Date,
    public likes: LikesPostDbType,
  ) {}
}

export class UserDbEntity {
  constructor(
    public _id: ObjectId,
    public id: IdType,
    public login: string,
    public passwordHash: string,
    public email: string,
    public isConfirmed: boolean,
    public confirmCode?: string | null,
  ) {}
}

export class CommentDbEntity {
  constructor(
    public _id: ObjectId,
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public addedAt: string,
    public postId: string,
    public likes: LikesCommentDbType,
  ) {}
}

export class BruteForceItem {
  constructor(
    public ip: string,
    public endpoint: string,
    public date: number,
  ) {}
}

export class BadRefreshTokenEntityType {
  constructor(public userId: string, public tokens: string[]) {}
}
