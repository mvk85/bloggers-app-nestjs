import { Post } from 'src/db/types';
import { PaginationData } from 'src/types';
import { Comment } from 'src/db/types';

export type PostCreateFields = {
  title: string;
  shortDescription: string;
  content: string;
  bloggerId: string;
};

export type ResponseCommentType = Omit<Comment, 'postId'>;

export type ResponsePosts = PaginationData & {
  items: Post[];
};

export type ResponseCommentsByPostId = PaginationData & {
  items: ResponseCommentType[];
};
