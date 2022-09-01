import { LikeItemType, LikesStatus } from 'src/db/types';

export type FilterComments = {
  postId?: string;
};

export type CommentLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikesStatus;
};

export type CommentResponseEntity = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  addedAt: string;
  likesInfo: CommentLikesInfo;
};

export type CommentCreateFields = {
  content: string;
  userId: string;
  postId: string;
};

export type LikeCommentFieldType = {
  addedAt: Date;
  userId: string;
  likeStatus: LikeItemType;
};
