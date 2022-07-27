import { Inject, Injectable } from '@nestjs/common';
import { removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { BloggersModel } from 'src/db/models.mongoose';
import { Blogger } from 'src/db/types';
import { FilterBloggers } from './types';

@Injectable()
export class BloggersRepository {
  constructor(
    @Inject(MongooseModelNamed.BloggersMongooseModel)
    private bloggersModel: typeof BloggersModel,
  ) {}

  async getBloggers(
    filter: FilterBloggers,
    skip: number,
    limit: number,
  ): Promise<Blogger[]> {
    const bloggers = await this.bloggersModel
      .find(filter, removeObjectIdOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return bloggers;
  }

  async getCountBloggers(filter: FilterBloggers): Promise<number> {
    const count = await this.bloggersModel.count(filter);

    return count;
  }

  async getBloggerById(id: string): Promise<Blogger | null> {
    const query = this.bloggersModel.findOne({ id }, removeObjectIdOption);

    const blogger = await query;

    return blogger;
  }

  async getBloggerByIdOrThrow(id: string): Promise<Blogger | null> {
    const blogger = await this.getBloggerById(id);

    if (!blogger) {
      throw new Error("Blogger didn't find by id");
    }

    return blogger;
  }

  async createBlogger(newBlogger: Blogger): Promise<Blogger | null> {
    await this.bloggersModel.create(newBlogger);

    const blogger = await this.bloggersModel.findOne(
      { id: newBlogger.id },
      removeObjectIdOption,
    );

    return blogger;
  }

  async deleteBloggerById(id: string) {
    const result = await this.bloggersModel.deleteOne({ id });

    return result.deletedCount === 1;
  }

  async updateBloggerById(
    id: string,
    { name, youtubeUrl }: { name: string; youtubeUrl: string },
  ) {
    const result = await this.bloggersModel.updateOne(
      { id },
      { $set: { name, youtubeUrl } },
    );

    return result.matchedCount === 1;
  }

  async deleteAllBloggers() {
    await this.bloggersModel.deleteMany({});
  }
}
