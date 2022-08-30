import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BloggerEntity } from '../types';
import { IBloggersRepository } from './IBloggersRepository';

@Injectable()
export class BloggersPgRepository implements IBloggersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getBloggers(
    SearchNameTerm: string,
    offset: number,
    limit: number,
  ): Promise<BloggerEntity[]> {
    const result = await this.dataSource.query(
      `
    select "id", "name", "youtubeUrl" 
    from "Bloggers" 
    where "name" like '%'||$1||'%'
    limit $2 
    offset $3
    `,
      [SearchNameTerm, limit, offset],
    );

    return result;
  }

  async getCountBloggers(SearchNameTerm = ''): Promise<number> {
    const result = await this.dataSource.query(
      `
      select count(*) from "Bloggers" 
      where name like '%'||$1||'%'
      `,
      [SearchNameTerm],
    );
    return Number(result[0].count);
  }

  async getBloggerById(id: string): Promise<BloggerEntity | null> {
    const result = await this.dataSource.query(
      `
    select "id", "name", "youtubeUrl" 
    from "Bloggers" 
    where "id" = $1
    `,
      [id],
    );

    return result[0];
  }

  async getBloggerByIdOrThrow(id: string): Promise<BloggerEntity | null> {
    const blogger = await this.getBloggerById(id);

    if (!blogger) {
      throw new Error("Blogger didn't find by id");
    }

    return blogger;
  }

  async createBlogger({ name, youtubeUrl }): Promise<string> {
    const result = await this.dataSource.query(
      `
    INSERT INTO "Bloggers"
      ("name", "youtubeUrl")
      VALUES ($1, $2) RETURNING "id";
    `,
      [name, youtubeUrl],
    );

    return result[0].id;
  }

  async deleteBloggerById(id: string) {
    const result = await this.dataSource.query(
      `
    DELETE FROM "Bloggers" WHERE "id" = $1;
    `,
      [id],
    );

    return !!result[1];
  }

  async updateBloggerById(
    id: string,
    { name, youtubeUrl }: { name: string; youtubeUrl: string },
  ) {
    const result = await this.dataSource.query(
      `
      update "Bloggers" set name = $1, "youtubeUrl" = $2 
      where id = $3
      `,
      [name, youtubeUrl, id],
    );

    return !!result[1];
  }

  async deleteAllBloggers() {
    await this.dataSource.query(
      `
      delete from "Bloggers"
      `,
    );
  }
}
