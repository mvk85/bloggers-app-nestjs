import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from 'src/feature/users/users.repository';

export const isNotConfirmedKey = 'IsNotConfirmed';

@ValidatorConstraint({ name: isNotConfirmedKey, async: true })
@Injectable()
export class IsNotConfirmedRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

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
