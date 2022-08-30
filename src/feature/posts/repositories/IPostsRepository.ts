import {
  GetPostsParams,
  LikePostFieldType,
  PostCreateFields,
  PostResponseEntity,
} from '../types';

export interface IPostsRepository {
  getPosts(params: GetPostsParams): Promise<PostResponseEntity[]>;

  getCountPosts(bloggerId?: string): Promise<number>;

  getPostById(id: string, userId?: string): Promise<PostResponseEntity | null>;

  getPostByIdOrThrow(id: string): Promise<PostResponseEntity | null>;

  createPost(newPost: PostCreateFields): Promise<PostResponseEntity>;

  deletePostById(id: string): Promise<boolean>;

  updatePostById(id: string, fields: PostCreateFields): Promise<boolean>;

  deleteAllPosts(): void;

  addOrUpdateLike(
    postId: string,
    likeItem: LikePostFieldType,
  ): Promise<boolean>;

  removeLike(postId: string, userId: string): Promise<boolean>;
}
