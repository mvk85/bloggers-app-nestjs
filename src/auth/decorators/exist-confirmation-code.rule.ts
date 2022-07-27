import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from 'src/feature/users/users.repository';

export const existConfirmationCodeKey = 'ExistConfirmationCode';

@ValidatorConstraint({ name: existConfirmationCodeKey, async: true })
@Injectable()
export class ExistConfirmationCodeRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByConfirmationCode(value);

    return !!user;
  }

  defaultMessage() {
    return this.makeMessageError();
  }

  private makeMessageError() {
    return `A code should exist`;
  }
}
