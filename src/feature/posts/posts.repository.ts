import { Inject, Injectable } from '@nestjs/common';
import { removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { PostsModel } from 'src/db/models.mongoose';
import { Post } from 'src/db/types';
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
  ): Promise<Post[]> {
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

  async getPostById(id: string): Promise<Post | null> {
    const post = await this.postsModel.findOne({ id }, removeObjectIdOption);

    return post;
  }

  async createPost(newPost: Post): Promise<Post | null> {
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
}
