import { BloggerEntity } from '../types';

export interface IBloggersRepository {
  getBloggers(
    SearchNameTerm: string,
    skip: number,
    limit: number,
  ): Promise<BloggerEntity[]>;

  getCountBloggers(SearchNameTerm: string): Promise<number>;

  getBloggerById(id: string): Promise<BloggerEntity | null>;

  getBloggerByIdOrThrow(id: string): Promise<BloggerEntity | null>;

  createBlogger(createdFields: {
    name: string;
    youtubeUrl: string;
  }): Promise<string>;

  deleteBloggerById(id: string): Promise<boolean>;

  updateBloggerById(
    id: string,
    { name, youtubeUrl }: { name: string; youtubeUrl: string },
  ): Promise<boolean>;

  deleteAllBloggers(): void;
}
