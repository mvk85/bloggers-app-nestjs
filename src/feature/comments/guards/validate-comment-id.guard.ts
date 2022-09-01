import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { RepositoryProviderKeys } from 'src/types';
import { ICommentsRepository } from '../repositories/ICommentsRepository';

@Injectable()
export class ValidateCommentId implements CanActivate {
  constructor(
    @Inject(RepositoryProviderKeys.comments)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const commentId = req.params.id;

    try {
      await this.commentsRepository.getCommentByIdOrThrow(commentId);
    } catch (e) {
      throw new NotFoundException(this.makeMessageError(commentId));
    }

    return true;
  }

  private makeMessageError(text) {
    return `A comment with the ID: ${text} doesn't exist`;
  }
}
