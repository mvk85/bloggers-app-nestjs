import { ObjectId } from 'mongodb';
import {
  LikeItemType,
  LikePostDbType,
  LikesStatus,
  PostDbEntity,
} from 'src/db/types';
import { PostsLikesMapper } from './likes-post.mapper';
import { LikesMapper } from './likes.mapper';

const generateLike = ({
  addedAt = new Date(),
  userId = '1',
  login = 'max',
  likeStatus = LikeItemType.Like,
}): LikePostDbType => ({
  addedAt,
  userId,
  login,
  likeStatus,
  _id: new ObjectId(),
});

const generateNewLike = (likeStatus: LikeItemType, addedAt?: Date) => {
  return generateLike({
    addedAt,
    userId: '1',
    login: 'max',
    likeStatus,
  });
};

describe('likes mapper', () => {
  let likeMapper = new LikesMapper();
  let postsLikesMapper = new PostsLikesMapper(likeMapper);

  beforeEach(() => {
    likeMapper = new LikesMapper();
    postsLikesMapper = new PostsLikesMapper(likeMapper);
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

    expect(postsLikesMapper.formatLike(like)).toEqual(formattedLike);
  });

  it('Should counted like by type', () => {
    const expectedCount = 2;
    const like1: LikePostDbType = generateNewLike(LikeItemType.Like);
    const like2: LikePostDbType = generateNewLike(LikeItemType.Like);
    const like3: LikePostDbType = generateNewLike(LikeItemType.Dislike);
    const data = [like1, like2, like3];

    expect(likeMapper.countByLikeType(data, LikeItemType.Like)).toEqual(
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
    const expectData = [like1, like4, like5];

    expect(postsLikesMapper.getNewestLike(rawData)).toEqual(expectData);
  });

  it('Should find myStatus', () => {
    const userId1 = '1';
    const userId2 = '2';
    const userId3 = '3';
    const like1 = generateLike({ userId: userId1 });
    const like2 = generateLike({ userId: userId2 });
    const like3 = generateLike({ userId: userId3 });
    const data = [like1, like2, like3];

    expect(likeMapper.findMyStatus(data, userId2)).toEqual(like2.likeStatus);
  });

  it('Should not find myStatus', () => {
    const userId1 = '1';
    const userId2 = '2';
    const userId3 = '3';
    const like1 = generateLike({ userId: userId1 });
    const like2 = generateLike({ userId: userId2 });
    const like3 = generateLike({ userId: userId3 });
    const data = [like1, like2, like3];

    expect(likeMapper.findMyStatus(data, '5')).toEqual(LikesStatus.None);
  });

  it('Should normalize post by likes', () => {
    const like1Date = new Date('2021-12-17T03:34:00');
    const like2Date = new Date('2021-12-17T03:04:00');
    const like3Date = new Date('2021-12-17T03:54:00');
    const like4Date = new Date('2021-12-17T03:24:00');
    const like5Date = new Date('2021-12-17T03:14:00');
    const userId1 = '1';
    const userId2 = '2';
    const userId3 = '3';
    const userId4 = '4';
    const userId5 = '5';
    const like1Db: LikePostDbType = generateLike({
      likeStatus: LikeItemType.Like,
      addedAt: like1Date,
      userId: userId1,
    });
    const like2Db: LikePostDbType = generateLike({
      likeStatus: LikeItemType.Like,
      addedAt: like2Date,
      userId: userId2,
    });
    const like3Db: LikePostDbType = generateLike({
      likeStatus: LikeItemType.Dislike,
      addedAt: like3Date,
      userId: userId3,
    });
    const like4Db: LikePostDbType = generateLike({
      likeStatus: LikeItemType.Like,
      addedAt: like4Date,
      userId: userId4,
    });
    const like5Db: LikePostDbType = generateLike({
      likeStatus: LikeItemType.Like,
      addedAt: like5Date,
      userId: userId5,
    });
    const likesDb = {
      status: LikesStatus.Like,
      data: [like1Db, like2Db, like3Db, like4Db, like5Db],
    };

    const postAddedAt = '2022-08-04T15:25:22.209Z';
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
            addedAt: like1Date,
            login: 'max',
            userId: userId1,
          },
          {
            addedAt: like4Date,
            login: 'max',
            userId: userId4,
          },
          {
            addedAt: like5Date,
            login: 'max',
            userId: userId5,
          },
        ],
      },
    };
    expect(postsLikesMapper.normalizePostLikes(post, userId1)).toEqual(
      normalizePosts,
    );
  });
});
