import { Inject, Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { RepositoryProviderKeys } from 'src/types';

export const isNotConfirmedByEmailKey = 'IsNotConfirmedByEmail';

@ValidatorConstraint({ name: isNotConfirmedByEmailKey, async: true })
@Injectable()
export class IsNotConfirmedByEmailRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(RepositoryProviderKeys.users)
    private usersRepository: IUsersRepository,
  ) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByEmail(value);

    return !user.isConfirmed;
  }

  defaultMessage() {
    return this.makeMessageError();
  }

  private makeMessageError() {
    return `A email should not be confirmed`;
  }
}
