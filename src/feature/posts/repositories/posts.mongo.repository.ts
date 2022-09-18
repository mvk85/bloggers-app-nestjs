import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/mongodb/const';
import { PostsModel } from 'src/db/mongodb/models.mongoose';
import { LikePostDbType, LikesStatus, PostDbEntity } from 'src/db/types';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { RepositoryProviderKeys } from 'src/types';
import { generateCustomId, newIsoDate } from 'src/utils';
import { PostsLikesMapper } from '../mappers/likes-post.mapper';
import { PostCreateFields, PostResponseEntity } from '../types';
import { IPostsRepository } from './IPostsRepository';

@Injectable()
export class PostsMongoRepository implements IPostsRepository {
  constructor(
    @Inject(MongooseModelNamed.PostsMongooseModel)
    private postsModel: typeof PostsModel,
    private postsLikesMapper: PostsLikesMapper,
    @Inject(RepositoryProviderKeys.bloggers)
    private bloggersRepository: IBloggersRepository,
  ) {}

  async getPosts({
    skip,
    limit,
    bloggerId,
    userId,
  }): Promise<PostResponseEntity[]> {
    const filter = { bloggerId };
    const posts = await this.postsModel
      .find(filter, removeObjectIdOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return this.postsLikesMapper.normalizePostsLikes(posts, userId);
  }

  async getCountPosts(bloggerId?: string): Promise<number> {
    const count = await this.postsModel.count({ bloggerId });

    return count;
  }

  async getPostById(
    id: string,
    userId?: string,
  ): Promise<PostResponseEntity | null> {
    const post = await this.postsModel.findOne({ id }, removeObjectIdOption);

    return post ? this.postsLikesMapper.normalizePostLikes(post, userId) : null;
  }

  async getPostByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<PostResponseEntity | null> {
    const post = await this.getPostById(id, userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(fields: PostCreateFields): Promise<PostResponseEntity> {
    const newPost: PostDbEntity = await this.makePostEntity(fields);
    await this.postsModel.create(newPost);

    return {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      bloggerId: newPost.bloggerId,
      bloggerName: newPost.bloggerName,
      addedAt: newPost.addedAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
        newestLikes: [],
      },
    };
  }

  private async makePostEntity(fields: PostCreateFields) {
    const initLike = this.makeInitLike();
    const blogger = await this.bloggersRepository.getBloggerById(
      fields.bloggerId,
    );
    const newPosts: PostDbEntity = new PostDbEntity(
      new ObjectId(),
      generateCustomId(),
      fields.title,
      fields.shortDescription,
      fields.content,
      blogger.id,
      blogger.name,
      newIsoDate(),
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

  async deletePostById(id: string): Promise<boolean> {
    const result = await this.postsModel.deleteOne({ id });

    return result.deletedCount === 1;
  }

  async updatePostById(id: string, fields: PostCreateFields): Promise<boolean> {
    const result = await this.postsModel.updateOne(
      { id },
      { $set: { ...fields } },
    );

    return result.matchedCount === 1;
  }

  async deleteAllPosts() {
    await this.postsModel.deleteMany({});
  }

  async likeExisted(postId: string, userId: string) {
    return this.postsModel.findOne({
      id: postId,
      'likes.data': { $elemMatch: { userId } },
    });
  }

  async addOrUpdateLike(
    postId: string,
    likeItem: LikePostDbType,
  ): Promise<boolean> {
    const likeExist = await this.likeExisted(postId, likeItem.userId);

    const filter = { id: postId };
    let update = {};
    let options = {};

    if (!likeExist) {
      update = {
        $push: {
          'likes.data': likeItem,
        },
      };
    } else {
      update = {
        $set: {
          'likes.data.$[element].likeStatus': likeItem.likeStatus,
        },
      };

      options = {
        arrayFilters: [{ 'element.userId': likeItem.userId }],
      };
    }

    await this.postsModel.findOneAndUpdate(filter, update, {
      ...options,
      ...removeObjectIdOption,
    });

    return true;
  }

  async removeLike(postId: string, userId: string): Promise<boolean> {
    await this.postsModel.findOneAndUpdate(
      { id: postId },
      {
        $pull: {
          'likes.data': { userId: userId },
        },
      },
    );

    return true;
  }
}
