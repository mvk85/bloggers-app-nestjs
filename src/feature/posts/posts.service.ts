import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PaginationParams } from 'src/types';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { CommentsRepository } from '../comments/comments.repository';
import {
  generateCustomId,
  generatePaginationData,
  newIsoDate,
} from 'src/utils';
import { PostsRepository } from './posts.repository';
import {
  PostCreateFields,
  ResponseCommentsByPostId,
  ResponsePosts,
} from './types';
import { Post, Comment } from 'src/db/types';

@Injectable()
export class PostsService {
  constructor(
    protected bloggersRepository: BloggersRepository,
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async getPosts(paginationParams: PaginationParams): Promise<ResponsePosts> {
    const postsCount = await this.postsRepository.getCountPosts();
    const paginationData = generatePaginationData(paginationParams, postsCount);

    const posts = await this.postsRepository.getPosts(
      {},
      paginationData.skip,
      paginationData.pageSize,
    );

    return {
      items: posts,
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: postsCount,
      page: paginationData.pageNumber,
    };
  }

  async getPostById(id: string): Promise<Post | null> {
    const post = await this.postsRepository.getPostById(id);

    return post;
  }

  async createPost(fields: PostCreateFields): Promise<Post | null> {
    const blogger = await this.bloggersRepository.getBloggerById(
      fields.bloggerId,
    );

    if (!blogger) return null;

    const newPosts: Post = new Post(
      new ObjectId(),
      generateCustomId(),
      fields.title,
      fields.shortDescription,
      fields.content,
      blogger.id,
      blogger.name,
    );

    const createdPost = await this.postsRepository.createPost(newPosts);

    return createdPost;
  }

  async deletePostById(id: string) {
    const isDeleted = await this.postsRepository.deletePostById(id);

    return isDeleted;
  }

  async updatePostById(id: string, fields: PostCreateFields) {
    const isUpdated = await this.postsRepository.updatePostById(id, fields);

    return isUpdated;
  }

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
    const newComment: Comment = new Comment(
      new ObjectId(),
      generateCustomId(),
      content,
      userId,
      userLogin,
      newIsoDate(),
      postId,
    );

    const createdComment = await this.commentsRepository.createComment(
      newComment,
    );

    return createdComment;
  }

  async getCommentsByPostId(
    postId: string,
    paginationParams: PaginationParams,
  ): Promise<ResponseCommentsByPostId> {
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
      items: comments,
      pagesCount: paginationData.pagesCount,
      pageSize: paginationData.pageSize,
      totalCount: commentsCount,
      page: paginationData.pageNumber,
    };
  }
}
