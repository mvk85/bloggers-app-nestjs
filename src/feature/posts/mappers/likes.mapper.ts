import { Injectable } from '@nestjs/common';
import { ILikeDbData, LikeItemType, LikesStatus } from 'src/db/types';

@Injectable()
export class LikesMapper {
  public findMyStatus<T extends ILikeDbData>(
    data: T[],
    userId?: string,
  ): LikesStatus {
    const currentLike = data.find((i) => i.userId === userId);

    if (!currentLike) return LikesStatus.None;

    const status =
      currentLike.likeStatus === LikeItemType.Like
        ? LikesStatus.Like
        : LikesStatus.Dislike;

    return status;
  }

  public countByLikeType<T extends ILikeDbData>(
    data: T[],
    likeType: LikeItemType,
  ) {
    let count = 0;

    data.forEach((like) => {
      if (like.likeStatus === likeType) {
        count++;
      }
    });

    return count;
  }
}
