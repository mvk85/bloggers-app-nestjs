import { Injectable } from '@nestjs/common';
import { CommentDbEntity, LikeItemType } from 'src/db/types';
import { LikeMapper } from './likes.mapper';
import { CommentResponseType } from './types';

@Injectable()
export class CommentsLikesMapper {
  constructor(private likeMapper: LikeMapper) {}

  public normalizeCommentsLikes(
    comments: CommentDbEntity[],
  ): CommentResponseType[] {
    return comments.map((comment) => this.normalizeCommentLikes(comment));
  }

  public normalizeCommentLikes(comment: CommentDbEntity): CommentResponseType {
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
        myStatus: this.likeMapper.findMyStatus(comment.likes.data),
      },
    };
  }
}
