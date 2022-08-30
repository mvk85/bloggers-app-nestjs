import { Injectable } from '@nestjs/common';
import { CommentDbEntity, LikeItemType, LikesStatus } from 'src/db/types';
import { LikesMapper } from './likes.mapper';
import { CommentResponseType } from '../types';

@Injectable()
export class CommentsLikesMapper {
  constructor(private likeMapper: LikesMapper) {}

  public normalizeCommentsLikes(
    comments: CommentDbEntity[],
    userId?: string,
  ): CommentResponseType[] {
    return comments.map((comment) =>
      this.normalizeCommentLikes(comment, userId),
    );
  }

  public normalizeCommentLikes(
    comment: CommentDbEntity,
    userId?: string,
  ): CommentResponseType {
    return {
      id: comment.id,
      content: comment.content,
      addedAt: comment.addedAt,
      userId: comment.userId,
      userLogin: comment.userLogin,
      likesInfo: {
        likesCount: this.likeMapper.countByLikeType(
          comment.likes.data,
          LikeItemType.Like,
        ),
        dislikesCount: this.likeMapper.countByLikeType(
          comment.likes.data,
          LikeItemType.Dislike,
        ),
        myStatus: userId
          ? this.likeMapper.findMyStatus(comment.likes.data, userId)
          : LikesStatus.None,
      },
    };
  }
}
