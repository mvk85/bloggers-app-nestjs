import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PostsRepository } from 'src/feature/posts/posts.repository';

@Injectable()
export class ValidatePostId implements CanActivate {
  constructor(private postsRepository: PostsRepository) {}

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
