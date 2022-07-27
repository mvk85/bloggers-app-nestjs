import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from 'src/feature/users/users.repository';

export const isNotConfirmedByEmailKey = 'IsNotConfirmedByEmail';

@ValidatorConstraint({ name: isNotConfirmedByEmailKey, async: true })
@Injectable()
export class IsNotConfirmedByEmailRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

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
