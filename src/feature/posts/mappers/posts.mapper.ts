import { LikesStatus } from 'src/db/types';

export class PostsMapper {
  mapPost(postRaw: any) {
    return {
      id: postRaw.id,
      title: postRaw.title,
      shortDescription: postRaw.shortDescription,
      content: postRaw.content,
      bloggerId: postRaw.bloggerId,
      bloggerName: postRaw.bloggerName,
      addedAt: postRaw.addedAt,
      extendedLikesInfo: {
        likesCount: Number(postRaw.likesCount),
        dislikesCount: Number(postRaw.dislikesCount),
        myStatus: postRaw.myStatus ? postRaw.myStatus : LikesStatus.None,
        newestLikes: postRaw.newestLike.nl
          ? this.mapNewestLike(postRaw.newestLike.nl)
          : [],
      },
    };
  }

  mapNewestLike(newestLike: any[]) {
    return newestLike.map((like) => ({
      ...like,
      addedAt: new Date(like.addedAt).toISOString(),
    }));
  }
}
