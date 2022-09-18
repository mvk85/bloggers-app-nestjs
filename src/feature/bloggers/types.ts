import { IdType } from 'src/db/types';
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

export type UpdateBloggerObject = { name: string; youtubeUrl: string };
