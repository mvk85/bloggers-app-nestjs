import { Injectable } from '@nestjs/common';
import { CommentDbEntity, LikeCommentDbType, LikeItemType } from 'src/db/types';
import { CommentResponseType } from './types';

@Injectable()
export class CommentsLikesMapper {
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
        likesCount: this.countByLikeType(comment.likes.data, LikeItemType.Like),
        dislikesCount: this.countByLikeType(
          comment.likes.data,
          LikeItemType.Dislike,
        ),
        myStatus: comment.likes.status,
      },
    };
  }

  public countByLikeType(data: LikeCommentDbType[], likeType: LikeItemType) {
    let count = 0;

    data.forEach((like) => {
      if (like.likeStatus === likeType) {
        count++;
      }
    });

    return count;
  }
}
