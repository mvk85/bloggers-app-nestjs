import { Inject, Injectable } from '@nestjs/common';
import { LikeItemType, LikesStatus } from 'src/db/types';
import { RepositoryProviderKeys } from 'src/types';
import { ICommentsRepository } from './repositories/ICommentsRepository';
import { LikeCommentFieldType } from './types';

@Injectable()
export class CommentLikesService {
  constructor(
    @Inject(RepositoryProviderKeys.comments)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

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
  ): Promise<LikeCommentFieldType> {
    const likeItemStatus =
      likeStatus === LikesStatus.Like
        ? LikeItemType.Like
        : LikeItemType.Dislike;

    return {
      addedAt: new Date(),
      userId,
      likeStatus: likeItemStatus,
    };
  }
}
