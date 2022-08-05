import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { PostsModel } from 'src/db/models.mongoose';
import { LikePostDbType, LikesStatus, PostDbEntity } from 'src/db/types';
import { PostCreateFields } from './types';

@Injectable()
export class PostsRepository {
  constructor(
    @Inject(MongooseModelNamed.PostsMongooseModel)
    private postsModel: typeof PostsModel,
  ) {}

  async getPosts(
    filter: object = {},
    skip: number,
    limit: number,
  ): Promise<PostDbEntity[]> {
    const posts = await this.postsModel
      .find(filter, removeObjectIdOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return posts;
  }

  async getCountPosts(filter: object = {}): Promise<number> {
    const count = await this.postsModel.count(filter);

    return count;
  }

  async getPostById(id: string): Promise<PostDbEntity | null> {
    const post = await this.postsModel.findOne({ id }, removeObjectIdOption);

    return post;
  }

  async getPostByIdOrThrow(id: string): Promise<PostDbEntity | null> {
    const post = await this.getPostById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(newPost: PostDbEntity): Promise<PostDbEntity | null> {
    await this.postsModel.create(newPost);

    const post = await this.postsModel.findOne(
      { id: newPost.id },
      removeObjectIdOption,
    );

    return post;
  }

  async deletePostById(id: string) {
    const result = await this.postsModel.deleteOne({ id });

    return result.deletedCount === 1;
  }

  async updatePostById(id: string, fields: PostCreateFields) {
    const result = await this.postsModel.updateOne(
      { id },
      { $set: { ...fields } },
    );

    return result.matchedCount === 1;
  }

  async deleteAllPosts() {
    await this.postsModel.deleteMany({});
  }

  async addOrUpdateLike(
    likeStatus: LikesStatus,
    postId: string,
    likeItem: LikePostDbType,
  ) {
    const likeExist = await this.postsModel.findOne({
      id: postId,
      'likes.data': { $elemMatch: { userId: likeItem.userId } },
    });

    const filter = { id: postId };
    let update = {};
    let options = {};

    if (!likeExist) {
      update = {
        $set: {
          'likes.status': likeStatus,
        },
        $push: {
          'likes.data': likeItem,
        },
      };
    } else {
      update = {
        $set: {
          'likes.status': likeStatus,
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

  async removeLike(likeStatus: LikesStatus, postId: string, userId: string) {
    await this.postsModel.findOneAndUpdate(
      { id: postId },
      {
        $set: {
          'likes.status': likeStatus,
        },
        $pull: {
          'likes.data': { userId: userId },
        },
      },
    );

    return true;
  }
}
