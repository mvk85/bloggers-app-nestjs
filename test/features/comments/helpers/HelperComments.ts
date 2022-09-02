import { TestingModule } from '@nestjs/testing';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { ICommentsRepository } from 'src/feature/comments/repositories/ICommentsRepository';
import { CommentResponseEntity } from 'src/feature/comments/types';
import { IPostsRepository } from 'src/feature/posts/repositories/IPostsRepository';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';

export class HelperComment {
  postsRepository: IPostsRepository;

  bloggersRepository: IBloggersRepository;

  usersRepository: IUsersRepository;

  commentsRepository: ICommentsRepository;

  constructor(testingModule: TestingModule) {
    this.postsRepository = testingModule.get<IPostsRepository>(
      RepositoryProviderKeys.posts,
    );
    this.bloggersRepository = testingModule.get<IBloggersRepository>(
      RepositoryProviderKeys.bloggers,
    );
    this.usersRepository = testingModule.get<IUsersRepository>(
      RepositoryProviderKeys.users,
    );
    this.commentsRepository = testingModule.get<ICommentsRepository>(
      RepositoryProviderKeys.comments,
    );
  }

  public async clear() {
    await this.commentsRepository.deleteAllComments();
    await this.postsRepository.deleteAllPosts();
    await this.bloggersRepository.deleteAllBloggers();
    await this.usersRepository.deleteAllUsers();
  }

  public expectCommentSchema(comment: CommentResponseEntity) {
    const commentSchema = {
      id: expect.any(String),
      content: expect.any(String),
      userId: expect.any(String),
      userLogin: expect.any(String),
      addedAt: expect.any(String),
      likesInfo: expect.objectContaining({
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.stringMatching(/^(Like|Dislike|None)$/),
      }),
    };

    expect(comment).toEqual(commentSchema);
  }
}
