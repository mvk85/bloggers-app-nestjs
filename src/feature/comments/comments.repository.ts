import { Inject, Injectable } from '@nestjs/common';
import { commentsProjection } from 'src/const';
import { MongooseModelNamed } from 'src/db/const';
import { CommentsModel } from 'src/db/models.mongoose';
import { FilterComments } from './types';
import { Comment } from 'src/db/types';

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

  async createComment(newComment: Comment) {
    await this.commentsModel.create(newComment);

    const createdComment = await this.commentsModel.findOne(
      { id: newComment.id },
      commentsProjection,
    );

    return createdComment;
  }

  async getCommentByid(id: string) {
    const comment = await this.commentsModel.findOne(
      { id },
      commentsProjection,
    );

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
}
