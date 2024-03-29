import { BadRequestException, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeCommentDbType, LikeItemType } from 'src/db/types';
import { CommentResponseType } from 'src/feature/posts/types';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';
import { newIsoDate } from 'src/utils';
import { DataSource } from 'typeorm';
import { CommentsMapper } from '../mappers/comments.mapper';
import { CommentCreateFields, CommentResponseEntity } from '../types';
import { ICommentsRepository } from './ICommentsRepository';

export class CommentsPgRepository implements ICommentsRepository {
  private readonly commentsMapper: CommentsMapper;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(RepositoryProviderKeys.users)
    private readonly usersRepository: IUsersRepository,
  ) {
    this.commentsMapper = new CommentsMapper();
  }

  async getCountComments(postId: string): Promise<number> {
    const result = await this.dataSource.query(
      `
      select count(*) from "Comments" cm
      where cm."postId" = $1
      `,
      [postId],
    );
    return Number(result[0].count);
  }

  async getComments(
    postId: string,
    skip: number,
    limit: number,
    userId?: string,
  ): Promise<CommentResponseType[]> {
    const result = await this.dataSource.query(
      `
      select
      c.id,
      c.content,
      c."addedAt",
      c."userId",
      (
        select login 
        from "Users" us
        where us.id = c."userId"
      ) as "userLogin",
      sum (case when cl."likeStatus" = 'Like' then 1 else 0 end) as "likesCount",
      sum (case when cl."likeStatus" = 'Dislike' then 1 else 0 end) as "dislikesCount",
      (
        select "likeStatus"
        from "CommentLikes" cl2
        where cl2."commentId" = c.id and cl2."userId" = $4 
      ) as "myStatus"
    from "Comments" c
    left join "Users" u on c."userId" = u.id
    left join "CommentLikes" cl ON cl."commentId" = c.id 
    where c."postId" = $1
    group by c.id, u.id
    order by c."addedAt"
    limit $3
    offset $2;
    `,
      [postId, skip, limit, userId],
    );

    return result.map((comment) => this.commentsMapper.mapComment(comment));
  }

  async createComment({
    content,
    userId,
    postId,
  }: CommentCreateFields): Promise<CommentResponseEntity> {
    try {
      const addedAt = newIsoDate();
      const result = await this.dataSource.query(
        `
      insert into "Comments" 
        ("content", "userId", "postId", "addedAt")
      values
        ($1, $2, $3, $4)
      returning id;
      `,
        [content, userId, postId, addedAt],
      );
      const user = await this.usersRepository.findUserByUserId(userId);

      return this.commentsMapper.mapComment({
        id: result[0].id,
        content,
        userId,
        userLogin: user.login,
        addedAt,
        likesCount: 0,
        dislikesCount: 0,
      });
    } catch (e) {
      throw new BadRequestException(
        'Comment was not created, data is not correct',
      );
    }
  }

  async getCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType | null> {
    try {
      const result = await this.dataSource.query(
        `
      select
        c.id,
        c.content,
        c."addedAt",
        c."userId",
        (
          select login 
          from "Users" us
          where us.id = c."userId"
        ) as "userLogin",
        sum (case when cl."likeStatus" = 'Like' then 1 else 0 end) as "likesCount",
        sum (case when cl."likeStatus" = 'Dislike' then 1 else 0 end) as "dislikesCount",
        (
          select "likeStatus"
          from "CommentLikes" cl2
          where cl2."userId" = $2 and cl2."commentId" = c.id
        ) as "myStatus"
      from "Comments" c
      left join "Users" u on c."userId" = u.id
      left join "CommentLikes" cl ON cl."commentId" = c.id 
      where c.id = $1
      group by c.id, u.id;
      `,
        [id, userId],
      );

      return this.commentsMapper.mapComment(result[0]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getCommentByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType> {
    const post = await this.getCommentById(id, userId);

    if (!post) {
      throw new Error("Post didn't find by id");
    }

    return post;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    delete from "Comments" cm 
    where cm."id" = $1;
    `,
      [id],
    );

    return !!result[1];
  }

  async updateCommentById(
    id: string,
    { content }: { content: string },
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update "Comments" 
      set 
        content = $1
      where
        id = $2
      `,
      [content, id],
    );

    return !!result[1];
  }

  async deleteAllComments(): Promise<void> {
    await this.dataSource.query(
      `
      TRUNCATE "Comments" CASCADE;
      `,
    );
  }

  async addOrUpdateLike(
    commentId: string,
    { likeStatus, userId, addedAt }: LikeCommentDbType,
  ): Promise<boolean> {
    const exist = await this.existCommentLikeByUserAndPostId(commentId, userId);

    if (exist) {
      const isUpdated = await this.updateCommentLike(
        commentId,
        userId,
        likeStatus,
      );

      return isUpdated;
    }

    const isCreated = await this.createCommentLike(commentId, {
      likeStatus,
      userId,
      addedAt,
    });

    return isCreated;
  }

  async existCommentLikeByUserAndPostId(
    commentId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    select exists (
      select 1 from "CommentLikes" cl 
      where 
        cl."commentId" = $1 and cl."userId" = $2
    )
    `,
      [commentId, userId],
    );

    return result[0].exists;
  }

  async updateCommentLike(
    commentId: string,
    userId: string,
    likeStatus: LikeItemType,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update "CommentLikes" set "likeStatus"=$1 
      where "userId"=$2 and "commentId"=$3;
    `,
      [likeStatus, userId, commentId],
    );

    return !!result[1];
  }

  async createCommentLike(
    commentId: string,
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
    try {
      await this.dataSource.query(
        `
        insert into "CommentLikes" 
          ("addedAt", "userId", "likeStatus", "commentId")
        values 
          ($1, $2, $3, $4);

      `,
        [addedAt, userId, likeStatus, commentId],
      );
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  }

  async removeLike(commentId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    delete from "CommentLikes" where "commentId" = $1 and "userId" = $2;
    `,
      [commentId, userId],
    );

    return !!result[1];
  }
}
