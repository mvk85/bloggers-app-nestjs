import { Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth.repository';
import { IpCheckerRepository } from 'src/auth/ip-checker/ip-checker.repository';
import { BloggersRepository } from 'src/feature/bloggers/bloggers.repository';
import { CommentsRepository } from 'src/feature/comments/comments.repository';
import { PostsRepository } from 'src/feature/posts/posts.repository';
import { UsersRepository } from 'src/feature/users/users.repository';

@Injectable()
export class TestingService {
  constructor(
    protected bloggersRepository: BloggersRepository,
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
    protected requestsRepository: IpCheckerRepository,
    protected usersRepository: UsersRepository,
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
