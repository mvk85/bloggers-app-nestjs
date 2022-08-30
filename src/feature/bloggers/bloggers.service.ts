import { Inject, Injectable } from '@nestjs/common';
import {
  PaginationParams,
  RepositoryProviderKeys,
  ResponseBloggers,
} from 'src/types';
import { generatePaginationData } from 'src/utils';
import { IPostsRepository } from '../posts/repositories/IPostsRepository';
import { IBloggersRepository } from './repositories/IBloggersRepository';
import {
  BloggerEntity,
  FilterBloggersParams,
  ResponsePostsByBloggerId,
} from './types';

@Injectable()
export class BloggersService {
  constructor(
    @Inject(RepositoryProviderKeys.bloggers)
    private bloggersRepository: IBloggersRepository,
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
  ) {}

  async getBloggers(
    filterParams: FilterBloggersParams = {},
    paginationParams: PaginationParams,
  ): Promise<ResponseBloggers> {
    const bloggersCount = await this.bloggersRepository.getCountBloggers(
      filterParams.SearchNameTerm,
    );
    const paginationData = generatePaginationData(
      paginationParams,
      bloggersCount,
    );

    const bloggers = await this.bloggersRepository.getBloggers(
      filterParams.SearchNameTerm || '',
      paginationData.skip,
      paginationData.pageSize,
    );

    return {
      items: bloggers,
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: bloggersCount,
      page: paginationData.pageNumber,
    };
  }

  async getPostsByBloggerId(
    bloggerId: string,
    paginationParams: PaginationParams,
    userId?: string,
  ): Promise<ResponsePostsByBloggerId> {
    const postsCount = await this.postsRepository.getCountPosts(bloggerId);
    const paginationData = generatePaginationData(paginationParams, postsCount);

    const posts = await this.postsRepository.getPosts({
      skip: paginationData.skip,
      limit: paginationData.pageSize,
      bloggerId,
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

  async getBloggerById(id: string): Promise<BloggerEntity | null> {
    const blogger = await this.bloggersRepository.getBloggerById(id);

    return blogger;
  }

  async createBlogger(
    name: string,
    youtubeUrl: string,
  ): Promise<BloggerEntity> {
    const newBloggerId = await this.bloggersRepository.createBlogger({
      name,
      youtubeUrl,
    });
    const createdBlogger = await this.bloggersRepository.getBloggerById(
      newBloggerId,
    );

    return createdBlogger;
  }

  async deleteBloggerById(id: string) {
    const isDeleted = await this.bloggersRepository.deleteBloggerById(id);

    return isDeleted;
  }

  async updateBloggerById(
    id: string,
    data: { name: string; youtubeUrl: string },
  ) {
    const isUpdated = await this.bloggersRepository.updateBloggerById(id, data);

    return isUpdated;
  }
}
