import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth.repository';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { ICommentsRepository } from 'src/feature/comments/repositories/ICommentsRepository';
import { IPostsRepository } from 'src/feature/posts/repositories/IPostsRepository';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';

@Injectable()
export class TestingService {
  constructor(
    @Inject(RepositoryProviderKeys.bloggers)
    private readonly bloggersRepository: IBloggersRepository,
    @Inject(RepositoryProviderKeys.comments)
    private readonly commentsRepository: ICommentsRepository,
    @Inject(RepositoryProviderKeys.posts)
    private readonly postsRepository: IPostsRepository,
    @Inject(RepositoryProviderKeys.users)
    private readonly usersRepository: IUsersRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async deleteAllData() {
    await this.commentsRepository.deleteAllComments();
    await this.postsRepository.deleteAllPosts();
    await this.bloggersRepository.deleteAllBloggers();
    await this.usersRepository.deleteAllUsers();
    await this.authRepository.clearBlackListRefreshTokens();
  }
}
