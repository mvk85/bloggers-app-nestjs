import { Inject, Injectable } from '@nestjs/common';
import { PaginationParams, RepositoryProviderKeys } from 'src/types';
import { generatePaginationData } from 'src/utils';
import { IPostsRepository } from './repositories/IPostsRepository';
import {
  PostCreateFields,
  PostsResponseType,
  PostResponseEntity,
} from './types';

@Injectable()
export class PostsService {
  constructor(
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
  ) {}

  async getPosts(
    paginationParams: PaginationParams,
    userId?: string,
  ): Promise<PostsResponseType> {
    const postsCount = await this.postsRepository.getCountPosts();
    const paginationData = generatePaginationData(paginationParams, postsCount);

    const posts = await this.postsRepository.getPosts({
      skip: paginationData.skip,
      limit: paginationData.pageSize,
      userId,
    });

    return {
      items: posts,
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: postsCount,
      page: paginationData.pageNumber,
    };
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostResponseEntity | null> {
    const post = await this.postsRepository.getPostById(postId, userId);

    return post;
  }

  async deletePostById(id: string) {
    const isDeleted = await this.postsRepository.deletePostById(id);

    return isDeleted;
  }

  async updatePostById(id: string, fields: PostCreateFields) {
    const isUpdated = await this.postsRepository.updatePostById(id, fields);

    return isUpdated;
  }
}
