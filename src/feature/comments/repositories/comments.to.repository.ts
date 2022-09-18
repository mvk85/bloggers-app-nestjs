import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLikes } from 'src/db/typeorm/entity/CommentLikes';
import { Comments } from 'src/db/typeorm/entity/Comments';
import { Posts } from 'src/db/typeorm/entity/Posts';
import { Users } from 'src/db/typeorm/entity/Users';
import { LikeItemType, LikesStatus } from 'src/db/types';
import { CommentResponseType } from 'src/feature/posts/types';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';
import { Repository } from 'typeorm';
import { CommentsMapper } from '../mappers/comments.mapper';
import {
  CommentCreateFields,
  CommentResponseEntity,
  LikeCommentFieldType,
} from '../types';
import { ICommentsRepository } from './ICommentsRepository';

export class CommentsToRepository implements ICommentsRepository {
  private readonly commentsMapper: CommentsMapper;

  constructor(
    @InjectRepository(Comments)
    private readonly commentsTypeormRepository: Repository<Comments>,
    @Inject(RepositoryProviderKeys.users)
    private readonly usersRepository: IUsersRepository,
    @InjectRepository(CommentLikes)
    private readonly commentLikesTypeormRepository: Repository<CommentLikes>,
  ) {
    this.commentsMapper = new CommentsMapper();
  }

  getCountComments(postId: string): Promise<number> {
    return this.commentsTypeormRepository.countBy({ post: { id: postId } });
  }

  async getComments(
    postId: string,
    skip: number,
    limit: number,
    userId?: string,
  ): Promise<CommentResponseType[]> {
    const queryGetComment = this.makeGetCommentQuery(userId);
    const commentsQueryResult = await queryGetComment
      .where('c."postId" = :postId', { postId })
      .groupBy('c.id')
      .addGroupBy('u.id')
      .orderBy('c."addedAt"')
      .skip(skip)
      .take(limit)
      .getRawMany();

    return commentsQueryResult.map((commentRaw) =>
      this.commentsMapper.mapComment(commentRaw),
    );
  }

  private makeGetCommentQuery(userId?: string) {
    return this.commentsTypeormRepository
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .addSelect('c.content', 'content')
      .addSelect('c."addedAt"', 'addedAt')
      .addSelect('c."userId"', 'userId')
      .addSelect((subQuery) => {
        return subQuery
          .select('us.login', 'userLogin')
          .from(Users, 'us')
          .where('us.id = c."userId"');
      }, 'userLogin')
      .addSelect(
        `sum (case when cl."likeStatus" = '${LikeItemType.Like}' then 1 else 0 end)`,
        'likesCount',
      )
      .addSelect(
        `sum (case when cl."likeStatus" = '${LikeItemType.Dislike}' then 1 else 0 end)`,
        'dislikesCount',
      )
      .addSelect((subQuery) => {
        return subQuery
          .select('cl2."likeStatus"', 'myStatus')
          .from(CommentLikes, 'cl2')
          .where('cl2."userId" = :userId', { userId })
          .andWhere('cl2."commentId" = c.id');
      }, 'myStatus')
      .leftJoin(Users, 'u', 'c."userId" = u.id')
      .leftJoin(CommentLikes, 'cl', 'cl."commentId" = c.id');
  }

  async getCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType> {
    const queryGetComment = this.makeGetCommentQuery(userId);
    const commentQueryResult = await queryGetComment
      .where('c.id = :commentId', { commentId: id })
      .groupBy('c.id')
      .addGroupBy('u.id')
      .getRawOne();

    return this.commentsMapper.mapComment(commentQueryResult);
  }

  async createComment(
    commentCreateFields: CommentCreateFields,
  ): Promise<CommentResponseEntity> {
    const newComment = new Comments();
    const post = new Posts();
    const user = new Users();
    post.id = commentCreateFields.postId;
    user.id = commentCreateFields.userId;
    newComment.addedAt = new Date();
    newComment.content = commentCreateFields.content;
    newComment.post = post;
    newComment.user = user;

    const createdComment = await this.commentsTypeormRepository.save(
      newComment,
    );
    const userItem = await this.usersRepository.findUserByUserId(
      commentCreateFields.userId,
    );

    return {
      id: createdComment.id,
      content: createdComment.content,
      userId: userItem.id,
      userLogin: userItem.login,
      addedAt: createdComment.addedAt.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
      },
    };
  }

  async getCommentByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType> {
    const comment = await this.getCommentById(id, userId);

    if (!comment) {
      throw new Error("Comment didn't find by id");
    }

    return comment;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const postQueryResult = await this.commentsTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    return !!postQueryResult.affected;
  }

  async updateCommentById(
    id: string,
    updateField: { content: string },
  ): Promise<boolean> {
    const commentQueryResult = await this.commentsTypeormRepository
      .createQueryBuilder()
      .update()
      .set({ content: updateField.content })
      .where('id = :id', { id })
      .execute();

    return !!commentQueryResult.affected;
  }

  async deleteAllComments(): Promise<void> {
    await this.commentsTypeormRepository.delete({});
  }

  async addOrUpdateLike(
    commentId: string,
    likeItem: LikeCommentFieldType,
  ): Promise<boolean> {
    const commentLikes = new CommentLikes();
    commentLikes.addedAt = likeItem.addedAt;
    commentLikes.commentId = commentId;
    commentLikes.userId = likeItem.userId;
    commentLikes.likeStatus = likeItem.likeStatus;

    const createdOrUpdateLike = await this.commentLikesTypeormRepository.save(
      commentLikes,
    );

    return !!createdOrUpdateLike;
  }

  async removeLike(commentId: string, userId: string): Promise<boolean> {
    const commentQueryResult = await this.commentsTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('"commentId" = :commentId', { commentId })
      .andWhere('"userId" = :userId', { userId })
      .execute();

    return !!commentQueryResult.affected;
  }
}
