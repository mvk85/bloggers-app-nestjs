import { BadRequestException, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { BloggerDbEntity, LikesStatus, PostDbEntity } from 'src/db/types';
import { generateCustomId } from 'src/utils';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { PostsLikesMapper } from './likes-post.mapper';
import { PostsRepository } from './posts.repository';
import { PostCreateFields, PostResponseEntity } from './types';

@Injectable()
export class PostCreateService {
  private blogger: BloggerDbEntity | null;

  constructor(
    private bloggersRepository: BloggersRepository,
    private postsRepository: PostsRepository,
    private postsLikesMapper: PostsLikesMapper,
  ) {}

  async createPost(
    fields: PostCreateFields,
  ): Promise<PostResponseEntity | null> {
    await this.checkBlogger(fields.bloggerId);

    const newPosts: PostDbEntity = this.makePostEntity(fields);
    const createdPost = await this.postsRepository.createPost(newPosts);

    return this.postsLikesMapper.normalizePostLikes(createdPost);
  }

  private async checkBlogger(bloggerId: string) {
    this.blogger = await this.bloggersRepository.getBloggerById(bloggerId);

    if (!this.blogger) {
      throw new BadRequestException(
        `Blogger with ID: ${bloggerId} should be exist`,
      );
    }
  }

  private makePostEntity(fields: PostCreateFields) {
    const initLike = this.makeInitLike();
    const newPosts: PostDbEntity = new PostDbEntity(
      new ObjectId(),
      generateCustomId(),
      fields.title,
      fields.shortDescription,
      fields.content,
      this.blogger.id,
      this.blogger.name,
      new Date(),
      initLike,
    );

    return newPosts;
  }

  private makeInitLike() {
    return {
      status: LikesStatus.None,
      data: [],
    };
  }
}
