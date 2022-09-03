import { Inject, Injectable } from '@nestjs/common';
import { commentsProjection, removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { CommentsModel } from 'src/db/models.mongoose';
import {
  CommentCreateFields,
  FilterComments,
  LikeCommentFieldType,
} from '../types';
import { CommentDbEntity, LikesStatus } from 'src/db/types';
import { ICommentsRepository } from './ICommentsRepository';
import { ObjectId } from 'mongodb';
import { generateCustomId, newIsoDate } from 'src/utils';
import { RepositoryProviderKeys } from 'src/types';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { CommentsLikesMapper } from 'src/feature/posts/mappers/likes-comment.mapper';
import { CommentResponseType } from 'src/feature/posts/types';

@Injectable()
export class CommentsMongoRepository implements ICommentsRepository {
  constructor(
    @Inject(MongooseModelNamed.CommentsMongooseModel)
    private commentsModel: typeof CommentsModel,
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
    private readonly commentsLikesMapper: CommentsLikesMapper,
  ) {}

  async getCountComments(postId: string): Promise<number> {
    const filter: FilterComments = { postId };
    const count = await this.commentsModel.count(filter);

    return count;
  }

  async getComments(
    postId: string,
    skip: number,
    limit: number,
    userId?: string,
  ): Promise<CommentResponseType[]> {
    const filter: FilterComments = { postId };
    const comments = await this.commentsModel
      .find(filter, commentsProjection)
      .skip(skip)
      .limit(limit)
      .lean();

    return this.commentsLikesMapper.normalizeCommentsLikes(comments, userId);
  }

  async createComment(commentFields: CommentCreateFields) {
    const userDb = await this.usersRepository.findUserByUserId(
      commentFields.userId,
    );
    const initLike = this.makeInitLike();
    const newComment: CommentDbEntity = new CommentDbEntity(
      new ObjectId(),
      generateCustomId(),
      commentFields.content,
      commentFields.userId,
      userDb.login,
      newIsoDate(),
      commentFields.postId,
      initLike,
    );
    await this.commentsModel.create(newComment);

    return {
      id: newComment.id,
      content: newComment.content,
      userId: newComment.userId,
      userLogin: newComment.userLogin,
      addedAt: newComment.addedAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
      },
    };
  }

  async getCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType | null> {
    const comment = await this.commentsModel.findOne(
      { id },
      commentsProjection,
    );

    return comment
      ? this.commentsLikesMapper.normalizeCommentLikes(comment, userId)
      : null;
  }

  async getCommentByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType | null> {
    const comment = await this.getCommentById(id, userId);

    if (!comment) {
      throw new Error("Comment didn't find by id");
    }

    return comment;
  }

  async deleteCommentById(id: string) {
    const result = await this.commentsModel.deleteOne({ id });

    return result.deletedCount === 1;
  }

  async updateCommentById(id: string, { content }: { content: string }) {
    const result = await this.commentsModel.updateOne(
      { id },
      { $set: { content } },
    );

    return result.matchedCount === 1;
  }

  async deleteAllComments() {
    await this.commentsModel.deleteMany({});
  }

  async addOrUpdateLike(commentId: string, likeItem: LikeCommentFieldType) {
    // TODO разделить на отдельные методы
    const likeExist = await this.commentsModel.findOne({
      id: commentId,
      'likes.data': { $elemMatch: { userId: likeItem.userId } },
    });

    const filter = { id: commentId };
    let update = {};
    let options = {};

    if (!likeExist) {
      update = {
        $push: {
          'likes.data': likeItem,
        },
      };
    } else {
      update = {
        $set: {
          'likes.data.$[element].likeStatus': likeItem.likeStatus,
        },
      };

      options = {
        arrayFilters: [{ 'element.userId': likeItem.userId }],
      };
    }

    await this.commentsModel.findOneAndUpdate(filter, update, {
      ...options,
      ...removeObjectIdOption,
    });

    return true;
  }

  async removeLike(commentId: string, userId: string) {
    await this.commentsModel.findOneAndUpdate(
      { id: commentId },
      {
        $pull: {
          'likes.data': { userId: userId },
        },
      },
    );

    return true;
  }

  private makeInitLike() {
    return {
      status: LikesStatus.None,
      data: [],
    };
  }
}
