import { BloggerDbEntity, IdType } from 'src/db/types';
import { PaginationData } from 'src/types';
import { PostResponseEntity } from '../posts/types';

export type FilterBloggers = {
  name?: { $regex: string };
};

export type FilterBloggersParams = {
  SearchNameTerm?: string;
};

export type ResponsePostsByBloggerId = PaginationData & {
  items: PostResponseEntity[];
};

export class BloggerEntity {
  constructor(
    public id: IdType,
    public name: string,
    public youtubeUrl: string,
  ) {}
}

export interface IBloggersRepository {
  getBloggers(
    SearchNameTerm: string,
    skip: number,
    limit: number,
  ): Promise<BloggerEntity[]>;

  getCountBloggers(SearchNameTerm: string): Promise<number>;

  getBloggerById(id: string): Promise<BloggerEntity | null>;

  getBloggerByIdOrThrow(id: string): Promise<BloggerEntity | null>;

  createBlogger(newBlogger: BloggerDbEntity): Promise<string>;

  deleteBloggerById(id: string): Promise<boolean>;

  updateBloggerById(
    id: string,
    { name, youtubeUrl }: { name: string; youtubeUrl: string },
  ): Promise<boolean>;

  deleteAllBloggers(): void;
}
