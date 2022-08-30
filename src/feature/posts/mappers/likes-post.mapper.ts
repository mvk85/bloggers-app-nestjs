import { Injectable } from '@nestjs/common';
import {
  LikeItemType,
  LikePostDbType,
  LikesStatus,
  PostDbEntity,
} from 'src/db/types';
import { LikesMapper } from './likes.mapper';
import { LikeItemResponseType, PostResponseEntity } from '../types';

@Injectable()
export class PostsLikesMapper {
  constructor(private likeMapper: LikesMapper) {}

  public normalizePostsLikes(
    posts: PostDbEntity[],
    userId?: string,
  ): PostResponseEntity[] {
    return posts.map((post) => this.normalizePostLikes(post, userId));
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
        likesCount: this.likeMapper.countByLikeType(
          post.likes.data,
          LikeItemType.Like,
        ),
        dislikesCount: this.likeMapper.countByLikeType(
          post.likes.data,
          LikeItemType.Dislike,
        ),
        myStatus: userId
          ? this.likeMapper.findMyStatus(post.likes.data, userId)
          : LikesStatus.None,
        newestLikes: this.getNewestLike(post.likes.data).map((like) =>
          this.formatLike(like),
        ),
      },
    };
  }

  public formatLike(like: LikePostDbType): LikeItemResponseType {
    return {
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.login,
    };
  }

  public getNewestLike(data: LikePostDbType[], countItems = 3) {
    const newestLikes = data
      .filter((like) => like.likeStatus === LikeItemType.Like)
      .sort((l1, l2) => l2.addedAt.valueOf() - l1.addedAt.valueOf())
      .slice(0, countItems);

    return newestLikes;
  }
}
