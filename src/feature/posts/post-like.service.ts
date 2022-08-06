import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { LikeItemType, LikePostDbType, LikesStatus } from 'src/db/types';
import { UsersRepository } from 'src/feature/users/users.repository';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostLikesService {
  constructor(
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
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
  ): Promise<LikePostDbType> {
    const userDb = await this.usersRepository.findUserByUserId(userId);
    const likeItemStatus =
      likeStatus === LikesStatus.Like
        ? LikeItemType.Like
        : LikeItemType.Dislike;

    return {
      _id: new ObjectId(),
      addedAt: new Date(),
      userId,
      login: userDb.login,
      likeStatus: likeItemStatus,
    };
  }
}
