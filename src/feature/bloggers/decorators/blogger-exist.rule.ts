import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RepositoryProviderKeys } from 'src/types';
import { IBloggersRepository } from '../types';

export const bloggerExistKey = 'BloggerExist';

@ValidatorConstraint({ name: bloggerExistKey, async: true })
@Injectable()
export class BloggerExistsByIdRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.bloggers)
    private bloggersRepository: IBloggersRepository,
  ) {}

  async validate(value: string) {
    try {
      await this.bloggersRepository.getBloggerByIdOrThrow(value);
    } catch (e) {
      throw new NotFoundException(this.makeMessageError(value));
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return this.makeMessageError(args.value);
  }

  private makeMessageError(text) {
    return `A blogger with the ID: ${text} doesn't exist`;
  }
}
