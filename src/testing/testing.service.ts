import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth.repository';
import { IpCheckerRepository } from 'src/auth/ip-checker/ip-checker.repository';
import { IBloggersRepository } from 'src/feature/bloggers/types';
import { CommentsRepository } from 'src/feature/comments/comments.repository';
import { IPostsRepository } from 'src/feature/posts/types';
import { IUsersRepository } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';

@Injectable()
export class TestingService {
  constructor(
    @Inject(RepositoryProviderKeys.bloggers)
    private bloggersRepository: IBloggersRepository,
    protected commentsRepository: CommentsRepository,
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
    protected requestsRepository: IpCheckerRepository,
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
    protected authRepository: AuthRepository,
  ) {}

  async deleteAllData() {
    await this.bloggersRepository.deleteAllBloggers();
    await this.commentsRepository.deleteAllComments();
    await this.postsRepository.deleteAllPosts();
    await this.usersRepository.deleteAllUsers();
    await this.requestsRepository.deleteAllRequests();
    await this.authRepository.clearBlackListRefreshTokens();
  }
}
