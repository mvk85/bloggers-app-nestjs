import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bloggers } from 'src/db/typeorm/entity/Bloggers';
import { Repository } from 'typeorm';
import { BloggerEntity } from '../types';
import { IBloggersRepository } from './IBloggersRepository';

@Injectable()
export class BloggersToRepository implements IBloggersRepository {
  constructor(
    @InjectRepository(Bloggers)
    private readonly bloggerTypeormRepository: Repository<Bloggers>,
  ) {}

  async getBloggers(
    SearchNameTerm: string,
    skip: number,
    limit: number,
  ): Promise<BloggerEntity[]> {
    return this.bloggerTypeormRepository
      .createQueryBuilder('blogger')
      .where("blogger.name like '%'||:name||'%'", { name: SearchNameTerm })
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async getCountBloggers(SearchNameTerm: string): Promise<number> {
    return this.bloggerTypeormRepository.countBy({ name: SearchNameTerm });
  }

  getBloggerById(id: string): Promise<BloggerEntity> {
    return this.bloggerTypeormRepository.findOneBy({ id });
  }

  async getBloggerByIdOrThrow(id: string): Promise<BloggerEntity> {
    const blogger = await this.getBloggerById(id);

    if (!blogger) {
      throw new Error("Blogger didn't find by id");
    }

    return blogger;
  }

  async createBlogger({
    name,
    youtubeUrl,
  }: {
    name: string;
    youtubeUrl: string;
  }): Promise<string> {
    const newBlogger = new Bloggers();
    newBlogger.name = name;
    newBlogger.youtubeUrl = youtubeUrl;
    const createdBlogger = await this.bloggerTypeormRepository.save(newBlogger);

    return createdBlogger.id;
  }

  async deleteBloggerById(id: string): Promise<boolean> {
    const result = await this.bloggerTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    return !!result?.affected;
  }

  async updateBloggerById(
    id: string,
    { name, youtubeUrl }: { name: string; youtubeUrl: string },
  ): Promise<boolean> {
    const result = await this.bloggerTypeormRepository
      .createQueryBuilder()
      .update()
      .set({ name, youtubeUrl })
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async deleteAllBloggers(): Promise<void> {
    await this.bloggerTypeormRepository.delete({});
  }
}
