import { Inject, Injectable } from '@nestjs/common';
import { LikeItemType, LikesStatus } from 'src/db/types';
import { RepositoryProviderKeys } from 'src/types';
import { IUsersRepository } from '../users/repositories/IUsersRepository';
import { IPostsRepository } from './repositories/IPostsRepository';
import { LikePostFieldType } from './types';

@Injectable()
export class PostLikesService {
  constructor(
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async setLike(likeStatus: LikesStatus, userId: string, postId: string) {
    if (likeStatus === LikesStatus.None) {
      await this.postsRepository.removeLike(postId, userId);

      return true;
    }

    const likeItem = await this.makeLikeItem(likeStatus, userId);

    await this.postsRepository.addOrUpdateLike(postId, likeItem);

    return;
  }

  private async makeLikeItem(
    likeStatus: LikesStatus,
    userId: string,
  ): Promise<LikePostFieldType> {
    const userDb = await this.usersRepository.findUserByUserId(userId);
    const likeItemStatus =
      likeStatus === LikesStatus.Like
        ? LikeItemType.Like
        : LikeItemType.Dislike;

    return {
      addedAt: new Date(),
      userId,
      login: userDb.login,
      likeStatus: likeItemStatus,
    };
  }
}
