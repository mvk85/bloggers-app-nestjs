import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { LikeCommentDbType, LikeItemType, LikesStatus } from 'src/db/types';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentLikesService {
  constructor(private commentsRepository: CommentsRepository) {}

  async setLike(likeStatus: LikesStatus, userId: string, commentId: string) {
    if (likeStatus === LikesStatus.None) {
      await this.commentsRepository.removeLike(commentId, userId);

      return true;
    }

    const likeItem = await this.makeLikeItem(likeStatus, userId);

    await this.commentsRepository.addOrUpdateLike(commentId, likeItem);

    return;
  }

  private async makeLikeItem(
    likeStatus: LikesStatus,
    userId: string,
  ): Promise<LikeCommentDbType> {
    const likeItemStatus =
      likeStatus === LikesStatus.Like
        ? LikeItemType.Like
        : LikeItemType.Dislike;

    return {
      _id: new ObjectId(),
      addedAt: new Date(),
      userId,
      likeStatus: likeItemStatus,
    };
  }
}
