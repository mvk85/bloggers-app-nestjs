import { Inject, Injectable } from '@nestjs/common';
import { PaginationParams, RepositoryProviderKeys } from 'src/types';
import { generatePaginationData } from 'src/utils';
import { ICommentsRepository } from '../comments/repositories/ICommentsRepository';
import { CommentCreateFields, CommentResponseEntity } from '../comments/types';
import { CommentsByPostIdResponseType } from './types';

@Injectable()
export class CommentsByPostService {
  constructor(
    @Inject(RepositoryProviderKeys.comments)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async createComment(
    commentFields: CommentCreateFields,
  ): Promise<CommentResponseEntity> {
    const createdComment = await this.commentsRepository.createComment(
      commentFields,
    );

    return createdComment;
  }

  async getCommentsByPostId(
    postId: string,
    paginationParams: PaginationParams,
    userId?: string,
  ): Promise<CommentsByPostIdResponseType> {
    const commentsCount = await this.commentsRepository.getCountComments(
      postId,
    );
    const paginationData = generatePaginationData(
      paginationParams,
      commentsCount,
    );

    const comments = await this.commentsRepository.getComments(
      postId,
      paginationData.skip,
      paginationData.pageSize,
      userId,
    );

    return {
      items: comments,
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: commentsCount,
      page: paginationData.pageNumber,
    };
  }
}
