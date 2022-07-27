import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PostsRepository } from '../posts.repository';

export const postExistKey = 'PostExist';

@ValidatorConstraint({ name: postExistKey, async: true })
@Injectable()
export class PostExistsByIdRule implements ValidatorConstraintInterface {
  constructor(private postsRepository: PostsRepository) {}

  async validate(value: string) {
    try {
      await this.postsRepository.getPostByIdOrThrow(value);
    } catch (e) {
      throw new NotFoundException(this.makeMessageError(value));
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return this.makeMessageError(args.value);
  }

  private makeMessageError(text) {
    return `A post with the ID: ${text} doesn't exist`;
  }
}
