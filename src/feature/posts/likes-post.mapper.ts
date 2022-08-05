import { Injectable } from '@nestjs/common';
import { LikeItemType, LikePostDbType, PostDbEntity } from 'src/db/types';
import { LikeItemResponseType, PostResponseEntity } from './types';

@Injectable()
export class PostsLikesMapper {
  public normalizePostsLikes(posts: PostDbEntity[]): PostResponseEntity[] {
    return posts.map((post) => this.normalizePostLikes(post));
  }

  public normalizePostLikes(post: PostDbEntity) {
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
        myStatus: post.likes.status,
        newestLikes: this.getNewestLike(post.likes.data).map((like) =>
          this.formatLike(like),
        ),
      },
    };
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
      .sort((l1, l2) => l1.addedAt.valueOf() - l2.addedAt.valueOf())
      .slice(0, countItems);

    return newestLikes;
  }
}
