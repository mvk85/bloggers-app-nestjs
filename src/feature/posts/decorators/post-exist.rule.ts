import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RepositoryProviderKeys } from 'src/types';
import { IPostsRepository } from '../repositories/IPostsRepository';

export const postExistKey = 'PostExist';

@ValidatorConstraint({ name: postExistKey, async: true })
@Injectable()
export class PostExistsByIdRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.posts)
    private postsRepository: IPostsRepository,
  ) {}

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
