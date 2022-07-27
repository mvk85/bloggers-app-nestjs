import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CommentsRepository } from '../comments.repository';

export const commentExistKey = 'CommentExist';

@ValidatorConstraint({ name: commentExistKey, async: true })
@Injectable()
export class CommentExistsByIdRule implements ValidatorConstraintInterface {
  constructor(private commentsRepository: CommentsRepository) {}

  async validate(value: string) {
    try {
      await this.commentsRepository.getCommentByIdOrThrow(value);
    } catch (e) {
      throw new NotFoundException(this.makeMessageError(value));
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return this.makeMessageError(args.value);
  }

  private makeMessageError(text) {
    return `A Comment with the ID: ${text} doesn't exist`;
  }
}
