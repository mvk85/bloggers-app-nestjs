import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IUsersRepository } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';

export const existsUserByEmailKey = 'ExistsUserByEmail';

@ValidatorConstraint({ name: existsUserByEmailKey, async: true })
@Injectable()
export class ExistsUserByEmailRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByEmail(value);

    return !!user;
  }

  defaultMessage(args: ValidationArguments) {
    return this.makeMessageError(args.value);
  }

  private makeMessageError(text) {
    return `A user with the email: ${text} not exist`;
  }
}
