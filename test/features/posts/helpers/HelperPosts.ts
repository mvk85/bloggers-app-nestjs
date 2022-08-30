import { TestingModule } from '@nestjs/testing';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { IPostsRepository } from 'src/feature/posts/repositories/IPostsRepository';
import { PostResponseEntity } from 'src/feature/posts/types';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';

export class HelperPosts {
  postsRepository: IPostsRepository;

  bloggersRepository: IBloggersRepository;

  userRepository: IUsersRepository;

  constructor(testingModule: TestingModule) {
    this.postsRepository = testingModule.get<IPostsRepository>(
      RepositoryProviderKeys.posts,
    );
    this.bloggersRepository = testingModule.get<IBloggersRepository>(
      RepositoryProviderKeys.bloggers,
    );
    this.userRepository = testingModule.get<IUsersRepository>(
      RepositoryProviderKeys.users,
    );
  }

  public async clear() {
    await this.postsRepository.deleteAllPosts();
    await this.bloggersRepository.deleteAllBloggers();
    await this.userRepository.deleteAllUsers();
  }

  public expectPostSchema(post: PostResponseEntity) {
    const hasNewestLike = !!post.extendedLikesInfo?.newestLikes.length;
    const postSchema = {
      id: expect.any(String),
      title: expect.any(String),
      shortDescription: expect.any(String),
      content: expect.any(String),
      bloggerId: expect.any(String),
      bloggerName: expect.any(String),
      addedAt: expect.any(String),
      extendedLikesInfo: expect.objectContaining({
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.stringMatching(/^(Like|Dislike|None)$/),
        newestLikes: hasNewestLike
          ? expect.arrayContaining([
              expect.objectContaining({
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: expect.any(String),
              }),
            ])
          : expect.any(Array),
      }),
    };

    expect(post).toEqual(postSchema);
  }
}
