import { LikesStatus } from 'src/db/types';
import { PostsMapper } from './posts.mapper';

describe('posts.mapper', () => {
  it('shoult return post when raw data is correct', () => {
    const rawData = {
      id: 'id',
      title: 'title',
      shortDescription: 'shortDescription',
      content: 'content',
      bloggerId: 'bloggerId',
      bloggerName: 'bloggerName',
      addedAt: '2022-08-28T22:01:59.925',
      likesCount: 0,
      dislikesCount: 1,
      myStatus: LikesStatus.None,
      newestLike: {
        nl: [
          {
            addedAt: '2022-08-28T22:21:59.925',
            userId: '62526dad-486f-4eb6-8396-9b4baa67c3b1',
            login: 'Jovany_Harper',
          },
          {
            addedAt: '2022-08-28T22:16:59.925',
            userId: '337b4a46-cc4f-416d-920c-a67e9e13eaf7',
            login: 'Preston_Gray',
          },
        ],
      },
    };

    const resultData = {
      id: rawData.id,
      title: rawData.title,
      shortDescription: rawData.shortDescription,
      content: rawData.content,
      bloggerId: rawData.bloggerId,
      bloggerName: rawData.bloggerName,
      addedAt: rawData.addedAt,
      extendedLikesInfo: {
        likesCount: Number(rawData.likesCount),
        dislikesCount: Number(rawData.dislikesCount),
        myStatus: rawData.myStatus ? rawData.myStatus : LikesStatus.None,
        newestLikes: rawData.newestLike.nl ? rawData.newestLike.nl : [],
      },
    };
    const postMapper = new PostsMapper();

    expect(postMapper.mapPost(rawData)).toEqual(resultData);
  });
});
