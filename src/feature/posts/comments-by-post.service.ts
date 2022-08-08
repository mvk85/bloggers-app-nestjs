import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CommentDbEntity, LikesStatus } from 'src/db/types';
import { PaginationParams } from 'src/types';
import {
  generateCustomId,
  generatePaginationData,
  newIsoDate,
} from 'src/utils';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentsLikesMapper } from './likes-comment.mapper';
import { CommentsByPostIdResponseType } from './types';

@Injectable()
export class CommentsByPostService {
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsLikesMapper: CommentsLikesMapper,
  ) {}

  async createComment({
    content,
    userId,
    userLogin,
    postId,
  }: {
    content: string;
    userId: string;
    userLogin: string;
    postId: string;
  }) {
    const initLike = this.makeInitLike();
    const newComment: CommentDbEntity = new CommentDbEntity(
      new ObjectId(),
      generateCustomId(),
      content,
      userId,
      userLogin,
      newIsoDate(),
      postId,
      initLike,
    );

    const createdComment = await this.commentsRepository.createComment(
      newComment,
    );

    return this.commentsLikesMapper.normalizeCommentLikes(createdComment);
  }

  async getCommentsByPostId(
    postId: string,
    paginationParams: PaginationParams,
    userId?: string,
  ): Promise<CommentsByPostIdResponseType> {
    const commentsCount = await this.commentsRepository.getCountComments({
      postId,
    });
    const paginationData = generatePaginationData(
      paginationParams,
      commentsCount,
    );
    const filter = { postId };

    const comments = await this.commentsRepository.getComments(
      filter,
      paginationData.skip,
      paginationData.pageSize,
    );

    return {
      items: this.commentsLikesMapper.normalizeCommentsLikes(comments, userId),
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: commentsCount,
      page: paginationData.pageNumber,
    };
  }

  private makeInitLike() {
    return {
      status: LikesStatus.None,
      data: [],
    };
  }
}
