import { Post } from 'src/db/types';
import { PaginationData } from 'src/types';

export type FilterBloggers = {
  name?: { $regex: string };
};

export type FilterBloggersParams = {
  SearchNameTerm?: string;
};

export type ResponsePostsByBloggerId = PaginationData & {
  items: Post[];
};
