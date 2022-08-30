import { Inject, Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';

export const isNotConfirmedKey = 'IsNotConfirmed';

@ValidatorConstraint({ name: isNotConfirmedKey, async: true })
@Injectable()
export class IsNotConfirmedRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByConfirmationCode(value);

    return !user.isConfirmed;
  }

  defaultMessage() {
    return this.makeMessageError();
  }

  private makeMessageError() {
    return `A code should not be confirmed`;
  }
}
