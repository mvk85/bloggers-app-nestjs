import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  PostDbEntity,
  LikePostDbType,
  LikeItemType,
  LikesStatus,
} from 'src/db/types';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { RepositoryProviderKeys } from 'src/types';
import { newIsoDate } from 'src/utils';
import { DataSource } from 'typeorm';
import { PostsMapper } from '../mappers/posts.mapper';
import {
  LikePostFieldType,
  PostCreateFields,
  PostResponseEntity,
} from '../types';
import { IPostsRepository } from './IPostsRepository';

export class PostsPgRepository implements IPostsRepository {
  private postMapper: PostsMapper = new PostsMapper();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(RepositoryProviderKeys.bloggers)
    private readonly bloggersRepository: IBloggersRepository,
  ) {}

  async getPosts({
    skip, // offset
    limit,
    bloggerId,
    userId,
  }): Promise<PostResponseEntity[]> {
    const result = await this.dataSource.query(
      `
      select 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        b.id as "bloggerId",
        b.name as "bloggerName",
        p."addedAt",
        sum (case when pl."likeStatus" = 'Like' then 1 else 0 end) as "likesCount",
        sum (case when pl."likeStatus" = 'Dislike' then 1 else 0 end) as "dislikesCount",
        (
          select "likeStatus" 
          from "PostLikes" postl 
          where 
            postl."userId" = $3 
          and
            postl."postId" = p.id
        ) as "myStatus",
        (
          select json_build_object('nl', json_agg(newest.likes))
          from (
            select json_build_object(
              'addedAt', postlikes."addedAt", 
              'userId', postlikes."userId", 
              'login', u."login"
            ) as likes 
            from "PostLikes" postlikes
            left join "Users" u on postlikes."userId" = u.id 
            where postlikes."postId" = p.id and postlikes."likeStatus" = 'Like'
            order by "addedAt" DESC
            limit 3
          ) newest
        ) as "newestLike"
      from "Posts" p
      inner join "Bloggers" b on p."bloggerId" = b.id
      left join "PostLikes" pl on p.id = pl."postId"
      ${bloggerId ? `where p."bloggerId" = $4` : ''}
      group by p.id, b.id
      order by p."addedAt"
      limit $1
      offset $2;
    `,
      [limit, skip, userId, ...(bloggerId ? [bloggerId] : [])],
    );

    return result.map((postRaw) => this.postMapper.mapPost(postRaw));
  }

  async getCountPosts(bloggerId?: string): Promise<number> {
    const result = await this.dataSource.query(
      `
      select count(*) from "Posts" p
      ${bloggerId ? `where p."bloggerId" = $1` : ''}
      `,
      bloggerId ? [bloggerId] : [],
    );
    return Number(result[0].count);
  }

  async getPostById(
    id: string,
    userId?: string,
  ): Promise<PostResponseEntity | null> {
    try {
      const result = await this.dataSource.query(
        `
        select 
          p.id,
          p.title,
          p."shortDescription",
          p.content,
          b.id as "bloggerId",
          b.name as "bloggerName",
          p."addedAt",
          sum (case when pl."likeStatus" = 'Like' then 1 else 0 end) as "likesCount",
          sum (case when pl."likeStatus" = 'Dislike' then 1 else 0 end) as "dislikesCount",
          (
            select "likeStatus" 
            from "PostLikes" postl 
            where 
              postl."userId" = $2 
            and
              postl."postId" = p.id
          ) as "myStatus",
          (
            select json_build_object('nl', json_agg(newest.likes))
            from (
              select json_build_object(
                'addedAt', postlikes."addedAt", 
                'userId', postlikes."userId", 
                'login', u."login"
              ) as likes 
              from "PostLikes" postlikes
              left join "Users" u on postlikes."userId" = u.id 
              where postlikes."postId" = p.id and postlikes."likeStatus" = 'Like'
              order by "addedAt" DESC
              limit 3
            ) newest
          ) as "newestLike"
        from "Posts" p
        inner join "Bloggers" b on p."bloggerId" = b.id
        left join "PostLikes" pl on p.id = pl."postId"
        where p.id = $1
        group by p.id, b.id;
      `,
        [id, userId],
      );

      const postRaw = result[0];
      const postMapper = new PostsMapper();

      return postMapper.mapPost(postRaw);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getMyLikeStatus(userId?: string): Promise<LikesStatus> {
    if (!userId) return LikesStatus.None;

    const result = await this.dataSource.query(
      `
      select p."likeStatus" from "PostLikes" p
      where p."userId" = $1
      `,
      [userId],
    );

    return result[0].likeStatus;
  }

  async countPostLikes(postId: string) {
    const result = await this.dataSource.query(
      `
      select count(*) from "PostLikes" 
      where "likeStatus" = 'Like' and "postId" = $1
      `,
      [postId],
    );
    return result[0].count;
  }

  async countPostDislike(postId: string) {
    const result = await this.dataSource.query(
      `
      select count(*) from "PostLikes" 
      where "likeStatus" = 'Dislike' and "postId" = $1
      `,
      [postId],
    );
    return result[0].count;
  }

  async getPostByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<PostResponseEntity | null> {
    const post = await this.getPostById(id, userId);

    if (!post) {
      throw new Error("Post didn't find by id");
    }

    return post;
  }

  async createPost({
    title,
    shortDescription,
    content,
    bloggerId,
  }: PostDbEntity): Promise<PostResponseEntity> {
    const addedAt = newIsoDate();
    const result = await this.dataSource.query(
      `
    insert into "Posts" 
      ("title", "shortDescription", "content", "bloggerId", "addedAt")
    values
      ($1, $2, $3, $4, $5)
    returning id;
    `,
      [title, shortDescription, content, bloggerId, addedAt],
    );
    const blogger = await this.bloggersRepository.getBloggerById(bloggerId);

    return {
      id: result[0].id,
      title,
      shortDescription,
      content,
      bloggerId,
      bloggerName: blogger.name,
      addedAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
        newestLikes: [],
      },
    };
  }

  async deletePostById(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    delete from "Posts" p 
    where p."id" = $1;
    `,
      [id],
    );

    return !!result[1];
  }

  async updatePostById(
    id: string,
    { title, shortDescription, content, bloggerId }: PostCreateFields,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update "Posts" 
      set 
        title = $1, 
        "shortDescription" = $2, 
        content = $3, 
        "bloggerId" = $4
      where
        id = $5
      `,
      [title, shortDescription, content, bloggerId, id],
    );

    return !!result[1];
  }

  async existPostLikeByUserAndPostId(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    select exists (
      select 1 from "PostLikes" pl 
      where 
        pl."postId" = $1 and pl."userId" = $2
    )
    `,
      [postId, userId],
    );

    return result[0].exists;
  }

  async updatePostLike(
    postId: string,
    userId: string,
    likeStatus: LikeItemType,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update "PostLikes" set "likeStatus"=$1 
      where "userId"=$2 and "postId"=$3;
    `,
      [likeStatus, userId, postId],
    );

    return !!result[1];
  }

  async createPostLike(
    postId: string,
    {
      likeStatus,
      userId,
      addedAt,
    }: {
      addedAt: Date;
      userId: string;
      likeStatus: LikeItemType;
    },
  ) {
    const result = await this.dataSource.query(
      `
        insert into "PostLikes" 
          ("addedAt", "userId", "likeStatus", "postId")
        values 
          ($1, $2, $3, $4) 
        returning "id";

      `,
      [addedAt, userId, likeStatus, postId],
    );

    return !!result[0].id;
  }

  async addOrUpdateLike(
    postId: string,
    { likeStatus, userId, addedAt }: LikePostFieldType,
  ): Promise<boolean> {
    const exist = await this.existPostLikeByUserAndPostId(postId, userId);

    if (exist) {
      const isUpdated = await this.updatePostLike(postId, userId, likeStatus);

      return isUpdated;
    }

    const isCreated = await this.createPostLike(postId, {
      likeStatus,
      userId,
      addedAt,
    });

    return isCreated;
  }

  async addOrUpdateLike2(
    postId: string,
    { likeStatus, userId, addedAt }: LikePostDbType,
  ): Promise<boolean> {
    const result = this.dataSource.query(
      `
    update "PostLikes" set "likeStatus"=$1 
    where "userId"=$2 and "postId"=$3;

    insert into "PostLikes" ("addedAt", "userId", "likeStatus", "postId")
      select $4, $2, $1, $3
      where not exists (
        select 1 from "PostLikes" 
        where "userId"=$2 and "postId"=$3;
      );  
  
    `,
      [likeStatus, userId, postId, addedAt],
    );

    return !!result[1];
  }

  async removeLike(postId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    delete from "PostLikes" where "postId" = $1 and "userId" = $2;
    `,
      [postId, userId],
    );

    return !!result[1];
  }

  async deleteAllPosts(): Promise<void> {
    await this.dataSource.query(
      `
      TRUNCATE "Posts" CASCADE;
      `,
    );
  }
}
