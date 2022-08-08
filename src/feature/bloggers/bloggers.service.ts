import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { BloggerDbEntity } from 'src/db/types';
import { PaginationParams, ResponseBloggers } from 'src/types';
import { generateCustomId, generatePaginationData } from 'src/utils';
import { PostsLikesMapper } from '../posts/likes-post.mapper';
import { PostsRepository } from '../posts/posts.repository';
import { BloggersRepository } from './bloggers.repository';
import { FilterBloggersParams, ResponsePostsByBloggerId } from './types';

@Injectable()
export class BloggersService {
  constructor(
    protected bloggersRepository: BloggersRepository,
    protected postsRepository: PostsRepository,
    private postsLikesMapper: PostsLikesMapper,
  ) {}

  async getBloggers(
    filterParams: FilterBloggersParams = {},
    paginationParams: PaginationParams,
  ): Promise<ResponseBloggers> {
    const filter = filterParams.SearchNameTerm
      ? { name: { $regex: filterParams.SearchNameTerm } }
      : {};

    const bloggersCount = await this.bloggersRepository.getCountBloggers(
      filter,
    );
    const paginationData = generatePaginationData(
      paginationParams,
      bloggersCount,
    );

    const bloggers = await this.bloggersRepository.getBloggers(
      filter,
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
    const filter = { bloggerId };
    const postsCount = await this.postsRepository.getCountPosts(filter);
    const paginationData = generatePaginationData(paginationParams, postsCount);

    const posts = await this.postsRepository.getPosts(
      filter,
      paginationData.skip,
      paginationData.pageSize,
    );

    return {
      items: this.postsLikesMapper.normalizePostsLikes(posts, userId),
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: postsCount,
      page: paginationData.pageNumber,
    };
  }

  async getBloggerById(id: string): Promise<BloggerDbEntity | null> {
    const blogger = await this.bloggersRepository.getBloggerById(id);

    return blogger;
  }

  async createBlogger(name: string, youtubeUrl: string) {
    const newBloggers: BloggerDbEntity = new BloggerDbEntity(
      new ObjectId(),
      generateCustomId(),
      name,
      youtubeUrl,
    );

    const createdBlogger = await this.bloggersRepository.createBlogger(
      newBloggers,
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
