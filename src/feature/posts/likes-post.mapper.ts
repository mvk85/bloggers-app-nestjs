import { Injectable } from '@nestjs/common';
import {
  LikeItemType,
  LikePostDbType,
  LikesStatus,
  PostDbEntity,
} from 'src/db/types';
import { LikeItemResponseType, PostResponseEntity } from './types';

@Injectable()
export class PostsLikesMapper {
  public normalizePostsLikes(posts: PostDbEntity[]): PostResponseEntity[] {
    return posts.map((post) => this.normalizePostLikes(post));
  }

  public normalizePostLikes(post: PostDbEntity, userId?: string) {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      bloggerId: post.bloggerId,
      bloggerName: post.bloggerName,
      addedAt: post.addedAt,
      extendedLikesInfo: {
        likesCount: this.countByLikeType(post.likes.data, LikeItemType.Like),
        dislikesCount: this.countByLikeType(
          post.likes.data,
          LikeItemType.Dislike,
        ),
        myStatus: userId
          ? this.findMyStatus(post.likes.data, userId)
          : LikesStatus.None,
        newestLikes: this.getNewestLike(post.likes.data).map((like) =>
          this.formatLike(like),
        ),
      },
    };
  }

  public findMyStatus(data: LikePostDbType[], userId: string): LikesStatus {
    const currentLike = data.find((i) => i.userId === userId);

    if (!currentLike) return LikesStatus.None;

    const status =
      currentLike.likeStatus === LikeItemType.Like
        ? LikesStatus.Like
        : LikesStatus.Dislike;

    return status;
  }

  public formatLike(like: LikePostDbType): LikeItemResponseType {
    return {
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login,
    };
  }

  public countByLikeType(data: LikePostDbType[], likeType: LikeItemType) {
    let count = 0;

    data.forEach((like) => {
      if (like.likeStatus === likeType) {
        count++;
      }
    });

    return count;
  }

  public getNewestLike(data: LikePostDbType[], countItems = 3) {
    const newestLikes = data
      .filter((like) => like.likeStatus === LikeItemType.Like)
      .sort((l1, l2) => l2.addedAt.valueOf() - l1.addedAt.valueOf())
      .slice(0, countItems);

    return newestLikes;
  }
}
