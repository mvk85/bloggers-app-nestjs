import { TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { IPostsRepository } from 'src/feature/posts/repositories/IPostsRepository';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { TestPosts } from 'test/features/posts/helpers/TestPosts';
import { TestUsers } from 'test/features/users/helpers/TestUsers';
import { RepositoryProviderKeys } from 'src/types';
import { ICommentsRepository } from 'src/feature/comments/repositories/ICommentsRepository';
import { LikeItemType, LikesStatus } from 'src/db/types';
import { LikeCommentFieldType } from 'src/feature/comments/types';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';
import { CreatedUserResponse } from 'src/feature/users/types';
import { CommentResponseType } from 'src/feature/posts/types';

export class TestComments {
  postsRepository: IPostsRepository;

  usersRepository: IUsersRepository;

  commentsRepository: ICommentsRepository;

  testUsersHelper: TestUsers;

  testPosts: TestPosts;

  dates: Date[];

  commonTestHelper: CommonTestHelper;

  constructor(testingModule: TestingModule) {
    this.testPosts = new TestPosts(testingModule);
    this.usersRepository = testingModule.get<IUsersRepository>(
      RepositoryProviderKeys.users,
    );
    this.commentsRepository = testingModule.get<ICommentsRepository>(
      RepositoryProviderKeys.comments,
    );
    this.testUsersHelper = new TestUsers(testingModule);
    this.commonTestHelper = new CommonTestHelper();
    this.dates = this.commonTestHelper.generateDates();
  }

  async make() {
    const user = await this.testUsersHelper.make();
    const user2 = await this.testUsersHelper.make();
    const { post } = await this.testPosts.make();
    const comment = await this.commentsRepository.createComment({
      content: this.generateContent(),
      userId: user.id,
      postId: post.id,
    });

    return {
      comment,
      user,
      user2,
    };
  }

  async makeWithLike({ notAuth = false }: { notAuth?: boolean } = {}) {
    const user1 = await this.testUsersHelper.make();
    const user2 = await this.testUsersHelper.make();
    const user3 = await this.testUsersHelper.make();

    const { post } = await this.testPosts.make();
    const commentDataTable = await this.commentsRepository.createComment({
      content: this.generateContent(),
      userId: user1.id,
      postId: post.id,
    });

    const user1LikeStatus = LikesStatus.Like;

    const like1 = this.generateLike(user1LikeStatus, user1, 1);
    const like2 = this.generateLike(LikesStatus.Like, user2, 2);
    const like3 = this.generateLike(LikesStatus.Dislike, user3, 3);

    await this.commentsRepository.addOrUpdateLike(commentDataTable.id, like1);
    await this.commentsRepository.addOrUpdateLike(commentDataTable.id, like2);
    await this.commentsRepository.addOrUpdateLike(commentDataTable.id, like3);

    const comment: CommentResponseType = {
      ...commentDataTable,
      likesInfo: {
        likesCount: 2,
        dislikesCount: 1,
        myStatus: notAuth ? LikesStatus.None : user1LikeStatus,
      },
    };

    return {
      comment,
      user: user1,
      user2: user2,
    };
  }

  async makeCreatedObject() {
    const user = await this.testUsersHelper.make();
    const { post } = await this.testPosts.make();

    return {
      createObject: {
        content: this.generateContent(),
        userId: user.id,
        postId: post.id,
      },
      post,
      user,
    };
  }

  private generateLike(
    likeStatus: LikesStatus,
    user: CreatedUserResponse,
    likeDateIndex: number,
  ): LikeCommentFieldType {
    const likeItemStatus =
      likeStatus === LikesStatus.Like
        ? LikeItemType.Like
        : LikeItemType.Dislike;

    return {
      addedAt: this.dates[likeDateIndex],
      userId: user.id,
      likeStatus: likeItemStatus,
    };
  }

  public generateContent() {
    return faker.lorem.sentence(5);
  }
}
