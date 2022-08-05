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
