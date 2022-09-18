import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bloggers } from 'src/db/typeorm/entity/Bloggers';
import { PostLikes } from 'src/db/typeorm/entity/PostLikes';
import { Posts } from 'src/db/typeorm/entity/Posts';
import { Users } from 'src/db/typeorm/entity/Users';
import { LikeItemType, LikesStatus } from 'src/db/types';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { RepositoryProviderKeys } from 'src/types';
import { Repository } from 'typeorm';
import { PostsMapper } from '../mappers/posts.mapper';
import {
  GetPostsParams,
  PostResponseEntity,
  PostCreateFields,
  LikePostFieldType,
} from '../types';
import { IPostsRepository } from './IPostsRepository';

export class PostsToRepository implements IPostsRepository {
  private postMapper: PostsMapper = new PostsMapper();

  constructor(
    @InjectRepository(Posts)
    private readonly postsTypeormRepository: Repository<Posts>,
    @InjectRepository(PostLikes)
    private readonly postLikesTypeormRepository: Repository<PostLikes>,
    @Inject(RepositoryProviderKeys.bloggers)
    private readonly bloggersRepository: IBloggersRepository,
  ) {}

  async getPosts({
    skip, // offset
    limit,
    bloggerId,
    userId,
  }: GetPostsParams): Promise<PostResponseEntity[]> {
    const queryGetPost = this.makeGetPostQuery(userId);

    if (bloggerId) {
      queryGetPost.where('p."bloggerId" = :bloggerId', { bloggerId });
    }

    const postsQueryResult = await queryGetPost
      .groupBy('p.id')
      .addGroupBy('bl.id')
      .orderBy('p."addedAt"')
      .skip(skip)
      .take(limit)
      .getRawMany();

    return postsQueryResult.map((postRaw) => this.postMapper.mapPost(postRaw));
  }

  async getCountPosts(bloggerId?: string): Promise<number> {
    return this.postsTypeormRepository.countBy({ blogger: { id: bloggerId } });
  }

  private makeGetPostQuery(userId?: string) {
    return this.postsTypeormRepository
      .createQueryBuilder('p')
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.addedAt', 'addedAt')
      .addSelect('bl.id', 'bloggerId')
      .addSelect('bl.name', 'bloggerName')
      .addSelect(
        `sum (case when pl."likeStatus" = '${LikeItemType.Like}' then 1 else 0 end)`,
        'likesCount',
      )
      .addSelect(
        `sum (case when pl."likeStatus" = '${LikeItemType.Dislike}' then 1 else 0 end)`,
        'dislikesCount',
      )
      .addSelect((subQuery) => {
        return subQuery
          .select('pl."likeStatus"', 'myStatus')
          .from(PostLikes, 'pl')
          .where('pl."userId" = :userId', { userId })
          .andWhere('pl."postId" = p.id');
      }, 'myStatus')
      .addSelect((subQuery) => {
        return subQuery
          .select("json_build_object('nl', json_agg(newest.likes))")
          .from((subQuery) => {
            return subQuery
              .select(
                `
            json_build_object(
              'addedAt', postlikes."addedAt", 
              'userId', postlikes."userId", 
              'login', u."login"
            )
            `,
                'likes',
              )
              .from(PostLikes, 'postlikes')
              .leftJoin(Users, 'u', 'postlikes."userId" = u.id')
              .where('postlikes."postId" = p.id')
              .andWhere('postlikes."likeStatus" = \'Like\'')
              .orderBy('postlikes."addedAt"', 'DESC')
              .limit(3);
          }, 'newest');
      }, 'newestLike')
      .innerJoin(Bloggers, 'bl', 'p.blogger.id = bl.id')
      .leftJoin(PostLikes, 'pl', 'p.id = pl."postId"');
  }

  async getPostById(id: string, userId?: string): Promise<PostResponseEntity> {
    const queryGetPost = this.makeGetPostQuery(userId);
    const postQueryResult = await queryGetPost
      .where('p.id = :id', { id })
      .groupBy('p.id')
      .addGroupBy('bl.id')
      .orderBy('p."addedAt"')
      .getRawOne();

    return this.postMapper.mapPost(postQueryResult);
  }

  async getPostByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<PostResponseEntity> {
    const post = await this.getPostById(id, userId);

    if (!post) {
      throw new Error("Post didn't find by id");
    }

    return post;
  }

  async createPost(fields: PostCreateFields): Promise<PostResponseEntity> {
    const newPost = new Posts();
    const blogger = new Bloggers();
    blogger.id = fields.bloggerId;

    newPost.content = fields.content;
    newPost.blogger = blogger;
    newPost.shortDescription = fields.shortDescription;
    newPost.title = fields.title;
    newPost.addedAt = new Date();

    const createdPost = await this.postsTypeormRepository.save(newPost);
    const bloggerItem = await this.bloggersRepository.getBloggerById(
      fields.bloggerId,
    );

    return {
      id: createdPost.id,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      bloggerId: bloggerItem.id,
      bloggerName: bloggerItem.name,
      addedAt: createdPost.addedAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
        newestLikes: [],
      },
    };
  }

  async deletePostById(id: string): Promise<boolean> {
    const result = await this.postsTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async updatePostById(
    id: string,
    { title, shortDescription, content, bloggerId }: PostCreateFields,
  ): Promise<boolean> {
    const result = await this.postsTypeormRepository
      .createQueryBuilder()
      .update()
      .set({ title, shortDescription, content, blogger: { id: bloggerId } })
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async deleteAllPosts(): Promise<void> {
    await this.postsTypeormRepository.delete({});
  }

  async addOrUpdateLike(
    postId: string,
    likeItem: LikePostFieldType,
  ): Promise<boolean> {
    const postLikes = new PostLikes();
    postLikes.addedAt = likeItem.addedAt;
    postLikes.likeStatus = likeItem.likeStatus;
    postLikes.postId = postId;
    postLikes.userId = likeItem.userId;

    const createOrUpdateLike = await this.postLikesTypeormRepository.save(
      postLikes,
    );

    return !!createOrUpdateLike;
  }

  async removeLike(postId: string, userId: string): Promise<boolean> {
    const result = await this.postLikesTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return !!result?.affected;
  }
}
