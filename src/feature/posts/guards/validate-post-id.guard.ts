import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { RepositoryProviderKeys } from 'src/types';
import { IPostsRepository } from '../repositories/IPostsRepository';

@Injectable()
export class ValidatePostId implements CanActivate {
  constructor(
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const postId = req.params.id;

    try {
      await this.postsRepository.getPostByIdOrThrow(postId);
    } catch (e) {
      throw new NotFoundException(this.makeMessageError(postId));
    }

    return true;
  }

  private makeMessageError(text) {
    return `A post with the ID: ${text} doesn't exist`;
  }
}
