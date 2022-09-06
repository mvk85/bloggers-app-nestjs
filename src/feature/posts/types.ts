import { IdType, LikeItemType, LikesStatus } from 'src/db/types';
import { PaginationData } from 'src/types';

export type PostCreateFields = {
  title: string;
  shortDescription: string;
  content: string;
  bloggerId: string;
};

export type LikeItemResponseType = {
  addedAt: string;
  userId: string;
  login: string;
};

export type NewestLikesType = LikeItemResponseType[];

export type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikesStatus;
  newestLikes: NewestLikesType;
};

export class PostEntity {
  constructor(
    public id: IdType,
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
    public bloggerName: string,
    public addedAt: Date,
  ) {}
}

export class PostResponseEntity {
  constructor(
    public id: IdType,
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
    public bloggerName: string,
    public addedAt: string,
    public extendedLikesInfo: ExtendedLikesInfoType,
  ) {}
}

export type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikesStatus;
};

export class CommentResponseType {
  constructor(
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public addedAt: string,
    public likesInfo: LikesInfoType,
  ) {}
}

export type PostsResponseType = PaginationData & {
  items: PostResponseEntity[];
};

export type CommentsByPostIdResponseType = PaginationData & {
  items: CommentResponseType[];
};

export type GetPostsParams = {
  skip: number;
  limit: number;
  bloggerId?: string;
  userId?: string;
};

export type LikePostFieldType = {
  userId: string;
  likeStatus: LikeItemType;
  addedAt: Date;
  login: string;
};
