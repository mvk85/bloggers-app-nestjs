import { Inject, Injectable } from '@nestjs/common';
import { RepositoryProviderKeys } from 'src/types';
import { IPostsRepository } from './repositories/IPostsRepository';
import { PostCreateFields, PostResponseEntity } from './types';

@Injectable()
export class PostCreateService {
  constructor(
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
  ) {}

  async createPost(
    fields: PostCreateFields,
  ): Promise<PostResponseEntity | null> {
    const createdPost = await this.postsRepository.createPost(fields);

    return createdPost;
  }
}
