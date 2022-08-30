import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { BloggersModel } from 'src/db/models.mongoose';
import { BloggerDbEntity } from 'src/db/types';
import { generateCustomId } from 'src/utils';
import { BloggerEntity, FilterBloggers } from '../types';
import { IBloggersRepository } from './IBloggersRepository';

@Injectable()
export class BloggersMongoRepository implements IBloggersRepository {
  constructor(
    @Inject(MongooseModelNamed.BloggersMongooseModel)
    private bloggersModel: typeof BloggersModel,
  ) {}

  async getBloggers(
    SearchNameTerm: string,
    skip: number,
    limit: number,
  ): Promise<BloggerDbEntity[]> {
    const filter: FilterBloggers = this.getFilter(SearchNameTerm);

    const bloggers = await this.bloggersModel
      .find(filter, removeObjectIdOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return bloggers;
  }

  private getFilter(SearchNameTerm: string): FilterBloggers {
    return SearchNameTerm ? { name: { $regex: SearchNameTerm } } : {};
  }

  async getCountBloggers(SearchNameTerm: string): Promise<number> {
    const filter: FilterBloggers = this.getFilter(SearchNameTerm);
    const count = await this.bloggersModel.count(filter);

    return count;
  }

  async getBloggerById(id: string): Promise<BloggerEntity | null> {
    const query = this.bloggersModel.findOne({ id }, removeObjectIdOption);

    const blogger = await query;

    return blogger;
  }

  async getBloggerByIdOrThrow(id: string): Promise<BloggerEntity | null> {
    const blogger = await this.getBloggerById(id);

    if (!blogger) {
      throw new Error("Blogger didn't find by id");
    }

    return blogger;
  }

  async createBlogger({ name, youtubeUrl }): Promise<string> {
    const newBlogger: BloggerDbEntity = new BloggerDbEntity(
      new ObjectId(),
      generateCustomId(),
      name,
      youtubeUrl,
    );
    await this.bloggersModel.create(newBlogger);

    return newBlogger.id;
  }

  async deleteBloggerById(id: string): Promise<boolean> {
    const result = await this.bloggersModel.deleteOne({ id });

    return result.deletedCount === 1;
  }

  async updateBloggerById(
    id: string,
    { name, youtubeUrl }: { name: string; youtubeUrl: string },
  ): Promise<boolean> {
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
