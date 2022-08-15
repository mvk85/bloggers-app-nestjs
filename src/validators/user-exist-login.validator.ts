import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IUsersRepository } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';

export const userExistByLoginKey = 'UserExistByLogin';

@ValidatorConstraint({ name: userExistByLoginKey, async: true })
@Injectable()
export class UserExistsByLoginRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByLogin(value);

    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    return this.makeMessageError(args.value);
  }

  private makeMessageError(text) {
    return `A user with the login: ${text} exist`;
  }
}
