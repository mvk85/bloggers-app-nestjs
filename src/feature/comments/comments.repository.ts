import { Inject, Injectable } from '@nestjs/common';
import { commentsProjection, removeObjectIdOption } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { CommentsModel } from 'src/db/models.mongoose';
import { FilterComments } from './types';
import { CommentDbEntity, LikeCommentDbType } from 'src/db/types';

@Injectable()
export class CommentsRepository {
  constructor(
    @Inject(MongooseModelNamed.CommentsMongooseModel)
    private commentsModel: typeof CommentsModel,
  ) {}

  async getCountComments(filter: FilterComments): Promise<number> {
    const count = await this.commentsModel.count(filter);

    return count;
  }

  async getComments(filter: FilterComments, skip: number, limit: number) {
    const comments = await this.commentsModel
      .find(filter, commentsProjection)
      .skip(skip)
      .limit(limit)
      .lean();

    return comments;
  }

  async createComment(newComment: CommentDbEntity) {
    await this.commentsModel.create(newComment);

    const createdComment = await this.commentsModel.findOne(
      { id: newComment.id },
      commentsProjection,
    );

    return createdComment;
  }

  async getCommentById(id: string): Promise<CommentDbEntity | null> {
    const comment = await this.commentsModel.findOne(
      { id },
      commentsProjection,
    );

    return comment;
  }

  async getCommentByIdOrThrow(id: string): Promise<CommentDbEntity | null> {
    const comment = await this.getCommentById(id);

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

  async addOrUpdateLike(commentId: string, likeItem: LikeCommentDbType) {
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
}
