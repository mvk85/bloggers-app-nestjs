import { ObjectId } from 'mongodb';
import {
  LikeItemType,
  LikePostDbType,
  LikesStatus,
  PostDbEntity,
} from 'src/db/types';
import { PostsLikesMapper } from './likes-post.mapper';

const generateNewLike = (likeStatus: LikeItemType, addedAt = new Date()) => {
  return {
    addedAt,
    userId: '1',
    login: 'max',
    likeStatus,
    _id: new ObjectId(),
  };
};

describe('likes mapper', () => {
  let likesMapper = new PostsLikesMapper();

  beforeEach(() => {
    likesMapper = new PostsLikesMapper();
  });

  it('Should format like', () => {
    const addedAt = new Date();
    const userId = '111';
    const login = 'max';
    const like: LikePostDbType = {
      addedAt,
      userId,
      login,
      likeStatus: LikeItemType.Like,
      _id: new ObjectId(),
    };
    const formattedLike = {
      addedAt,
      userId,
      login,
    };

    expect(likesMapper.formatLike(like)).toEqual(formattedLike);
  });

  it('Should counted like by type', () => {
    const expectedCount = 2;
    const like1: LikePostDbType = generateNewLike(LikeItemType.Like);
    const like2: LikePostDbType = generateNewLike(LikeItemType.Like);
    const like3: LikePostDbType = generateNewLike(LikeItemType.Dislike);
    const data = [like1, like2, like3];

    expect(likesMapper.countByLikeType(data, LikeItemType.Like)).toEqual(
      expectedCount,
    );
  });

  it('Shoult get newest likes', () => {
    const like1Date = new Date('2021-12-17T03:34:00');
    const like2Date = new Date('2021-12-17T03:04:00');
    const like4Date = new Date('2021-12-17T03:24:00');
    const like5Date = new Date('2021-12-17T03:14:00');
    const like1: LikePostDbType = generateNewLike(LikeItemType.Like, like1Date);
    const like2: LikePostDbType = generateNewLike(LikeItemType.Like, like2Date);
    const like3: LikePostDbType = generateNewLike(LikeItemType.Dislike);
    const like4: LikePostDbType = generateNewLike(LikeItemType.Like, like4Date);
    const like5: LikePostDbType = generateNewLike(LikeItemType.Like, like5Date);

    const rawData = [like1, like2, like3, like4, like5];
    const expectData = [like2, like5, like4];

    expect(likesMapper.getNewestLike(rawData)).toEqual(expectData);
  });

  it('Should normalize post by likes', () => {
    const like1Date = new Date('2021-12-17T03:34:00');
    const like2Date = new Date('2021-12-17T03:04:00');
    const like4Date = new Date('2021-12-17T03:24:00');
    const like5Date = new Date('2021-12-17T03:14:00');
    const like1Db: LikePostDbType = generateNewLike(
      LikeItemType.Like,
      like1Date,
    );
    const like2Db: LikePostDbType = generateNewLike(
      LikeItemType.Like,
      like2Date,
    );
    const like3Db: LikePostDbType = generateNewLike(LikeItemType.Dislike);
    const like4Db: LikePostDbType = generateNewLike(
      LikeItemType.Like,
      like4Date,
    );
    const like5Db: LikePostDbType = generateNewLike(
      LikeItemType.Like,
      like5Date,
    );
    const likesDb = {
      status: LikesStatus.Like,
      data: [like1Db, like2Db, like3Db, like4Db, like5Db],
    };

    const postAddedAt = new Date('2022-08-04T15:25:22.209Z');
    const postId = '123';
    const postTitle = 'title';
    const postShortDescription = 'desc';
    const postContent = 'content';
    const postBloggerId = '222';
    const postBloggerName = 'Ivan';
    const post: PostDbEntity = new PostDbEntity(
      new ObjectId(),
      postId,
      postTitle,
      postShortDescription,
      postContent,
      postBloggerId,
      postBloggerName,
      postAddedAt,
      likesDb,
    );

    const normalizePosts = {
      addedAt: postAddedAt,
      id: postId,
      title: postTitle,
      shortDescription: postShortDescription,
      content: postContent,
      bloggerId: postBloggerId,
      bloggerName: postBloggerName,
      extendedLikesInfo: {
        dislikesCount: 1,
        likesCount: 4,
        myStatus: LikesStatus.Like,
        newestLikes: [
          {
            addedAt: like2Date,
            login: 'max',
            userId: '1',
          },
          {
            addedAt: like5Date,
            login: 'max',
            userId: '1',
          },
          {
            addedAt: like4Date,
            login: 'max',
            userId: '1',
          },
        ],
      },
    };
    expect(likesMapper.normalizePostLikes(post)).toEqual(normalizePosts);
  });
});
