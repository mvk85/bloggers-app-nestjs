import { Injectable } from '@nestjs/common';
import { PaginationParams } from 'src/types';
import { generatePaginationData } from 'src/utils';
import { PostsRepository } from './posts.repository';
import {
  PostCreateFields,
  PostsResponseType,
  PostResponseEntity,
} from './types';
import { PostsLikesMapper } from './likes-post.mapper';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private postsLikesMapper: PostsLikesMapper,
  ) {}

  async getPosts(
    paginationParams: PaginationParams,
  ): Promise<PostsResponseType> {
    const postsCount = await this.postsRepository.getCountPosts();
    const paginationData = generatePaginationData(paginationParams, postsCount);

    const posts = await this.postsRepository.getPosts(
      {},
      paginationData.skip,
      paginationData.pageSize,
    );

    return {
      items: this.postsLikesMapper.normalizePostsLikes(posts),
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: postsCount,
      page: paginationData.pageNumber,
    };
  }

  async getPostById(id: string): Promise<PostResponseEntity | null> {
    const post = await this.postsRepository.getPostById(id);

    return post ? this.postsLikesMapper.normalizePostLikes(post) : null;
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
