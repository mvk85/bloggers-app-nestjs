import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from 'src/feature/users/users.repository';

export const existsUserByEmailKey = 'ExistsUserByEmail';

@ValidatorConstraint({ name: existsUserByEmailKey, async: true })
@Injectable()
export class ExistsUserByEmailRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

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
