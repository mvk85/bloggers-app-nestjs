import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RepositoryProviderKeys } from 'src/types';
import { ICommentsRepository } from '../repositories/ICommentsRepository';

export const commentExistKey = 'CommentExist';

@ValidatorConstraint({ name: commentExistKey, async: true })
@Injectable()
export class CommentExistsByIdRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.comments)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

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
