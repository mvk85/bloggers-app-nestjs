import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from '../comments.service';

@Injectable()
export class CommentCredentialsGuard implements CanActivate {
  constructor(protected commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const commentId = req.params.id;
    // TODO убрать
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.user.userId;
    const currentComment = await this.commentsService.getById(commentId);

    if (userId !== currentComment?.userId) {
      throw new ForbiddenException();
    }

    return true;
  }
}
