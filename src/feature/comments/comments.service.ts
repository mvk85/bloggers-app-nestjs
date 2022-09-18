import { Inject, Injectable } from '@nestjs/common';
import { RepositoryProviderKeys } from 'src/types';
import { CommentResponseType } from '../posts/types';
import { ICommentsRepository } from './repositories/ICommentsRepository';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(RepositoryProviderKeys.comments)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async deleteById(id: string) {
    const isDeleted = await this.commentsRepository.deleteCommentById(id);

    return isDeleted;
  }

  async getById(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType | null> {
    try {
      const comment = await this.commentsRepository.getCommentById(id, userId);

      return comment;
    } catch (e) {
      console.log(e);

      return null;
    }
  }

  async updateById(id: string, fields: { content: string }) {
    const isUpdated = await this.commentsRepository.updateCommentById(
      id,
      fields,
    );

    return isUpdated;
  }
}
