import { TestingModule } from '@nestjs/testing';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { IPostsRepository } from 'src/feature/posts/repositories/IPostsRepository';
import { RepositoryProviderKeys } from 'src/types';

export class HelperBloggers {
  testingModule: TestingModule;

  postsRepository: IPostsRepository;

  bloggersRepository: IBloggersRepository;

  constructor(testingModule: TestingModule) {
    this.postsRepository = testingModule.get<IPostsRepository>(
      RepositoryProviderKeys.posts,
    );
    this.bloggersRepository = testingModule.get<IBloggersRepository>(
      RepositoryProviderKeys.bloggers,
    );
  }

  public async clear() {
    await this.postsRepository.deleteAllPosts();
    await this.bloggersRepository.deleteAllBloggers();
  }

  public expectBloggerSchema(blogger: any) {
    const bloggerSchema = {
      id: expect.any(String),
      name: expect.any(String),
      youtubeUrl: expect.any(String),
    };

    expect(blogger).toEqual(bloggerSchema);
  }
}
