import { Injectable } from '@nestjs/common';
import { CommentsLikesMapper } from '../posts/mappers/likes-comment.mapper';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsLikesMapper: CommentsLikesMapper,
  ) {}

  async deleteById(id: string) {
    const isDeleted = await this.commentsRepository.deleteCommentById(id);

    return isDeleted;
  }

  async getById(id: string, userId?: string) {
    const comment = await this.commentsRepository.getCommentById(id);

    return comment
      ? this.commentsLikesMapper.normalizeCommentLikes(comment, userId)
      : null;
  }

  async updateById(id: string, fields: { content: string }) {
    const isUpdated = await this.commentsRepository.updateCommentById(
      id,
      fields,
    );

    return isUpdated;
  }
}
