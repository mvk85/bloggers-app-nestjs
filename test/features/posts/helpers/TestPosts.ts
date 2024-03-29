import { faker } from '@faker-js/faker';
import { TestingModule } from '@nestjs/testing';
import { LikeItemType, LikesStatus } from 'src/db/types';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { IPostsRepository } from 'src/feature/posts/repositories/IPostsRepository';
import {
  LikeItemResponseType,
  LikePostFieldType,
  PostCreateFields,
  PostResponseEntity,
} from 'src/feature/posts/types';
import { CreatedUserResponse } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';
import { TestBloggers } from 'test/features/bloggers/helpers/TestBloggers';
import { TestUsers } from 'test/features/users/helpers/TestUsers';
import { AuthHelper } from 'test/helper/AuthHelper';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';

export class TestPosts {
  postsRepository: IPostsRepository;

  bloggersRepository: IBloggersRepository;

  testBloggers: TestBloggers;

  testUsersHelper: TestUsers;

  dates: Date[];

  commonTestHelper: CommonTestHelper;

  authHelper: AuthHelper;

  constructor(testingModule: TestingModule) {
    this.postsRepository = testingModule.get<IPostsRepository>(
      RepositoryProviderKeys.posts,
    );
    this.bloggersRepository = testingModule.get<IBloggersRepository>(
      RepositoryProviderKeys.bloggers,
    );

    this.testBloggers = new TestBloggers(this.bloggersRepository);
    this.testUsersHelper = new TestUsers(testingModule);
    this.commonTestHelper = new CommonTestHelper();
    this.authHelper = new AuthHelper(testingModule);
    this.dates = this.commonTestHelper.generateDates();
  }

  async make() {
    const blogger = await this.testBloggers.make();
    const post = await this.postsRepository.createPost({
      title: this.generateTitle(),
      shortDescription: this.generateShortDescription(),
      content: this.generateContent(),
      bloggerId: blogger.id,
    });

    return {
      blogger,
      post,
    };
  }

  async makeWithLikes({ notAuth = false }: { notAuth?: boolean } = {}) {
    const blogger = await this.testBloggers.make();
    const postDataTable = await this.postsRepository.createPost({
      title: this.generateTitle(),
      shortDescription: this.generateShortDescription(),
      content: this.generateContent(),
      bloggerId: blogger.id,
    });
    const user1Password = this.testUsersHelper.generatePassword();
    const user1LikeStatus = LikesStatus.Like;

    const user1 = await this.testUsersHelper.make(user1Password);
    const user2 = await this.testUsersHelper.make(user1Password);
    const user3 = await this.testUsersHelper.make(user1Password);
    const user4 = await this.testUsersHelper.make(user1Password);

    const like1 = this.generateLike(user1LikeStatus, user1, 1);
    const like2 = this.generateLike(LikesStatus.Like, user2, 2);
    const like3 = this.generateLike(LikesStatus.Dislike, user3, 3);
    const like4 = this.generateLike(LikesStatus.Dislike, user4, 4);

    await this.postsRepository.addOrUpdateLike(postDataTable.id, like1);
    await this.postsRepository.addOrUpdateLike(postDataTable.id, like2);
    await this.postsRepository.addOrUpdateLike(postDataTable.id, like3);
    await this.postsRepository.addOrUpdateLike(postDataTable.id, like4);

    const post: PostResponseEntity = {
      ...postDataTable,
      extendedLikesInfo: {
        likesCount: 2,
        dislikesCount: 2,
        myStatus: notAuth ? LikesStatus.None : user1LikeStatus,
        newestLikes: [
          this.formatLikeObject(like1),
          this.formatLikeObject(like2),
        ],
      },
    };

    return {
      blogger,
      post,
      userPassword: user1Password,
      user: user1,
    };
  }

  async makeCreatedObject(): Promise<PostCreateFields> {
    const blogger = await this.testBloggers.make();

    return {
      title: this.generateTitle(),
      shortDescription: this.generateShortDescription(),
      content: this.generateContent(),
      bloggerId: blogger.id,
    };
  }

  private formatLikeObject(like: LikePostFieldType): LikeItemResponseType {
    return {
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.login,
    };
  }

  generateLike(
    likeStatus: LikesStatus,
    user: CreatedUserResponse,
    likeDateIndex: number,
  ): LikePostFieldType {
    const likeItemStatus =
      likeStatus === LikesStatus.Like
        ? LikeItemType.Like
        : LikeItemType.Dislike;

    return {
      addedAt: this.dates[likeDateIndex],
      userId: user.id,
      login: user.login,
      likeStatus: likeItemStatus,
    };
  }

  public generateTitle() {
    return faker.lorem.word(10);
  }

  public generateShortDescription() {
    return faker.lorem.sentence(5);
  }

  public generateContent() {
    return faker.lorem.sentence(5);
  }
}
