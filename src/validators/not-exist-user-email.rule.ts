import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from 'src/feature/users/users.repository';

export const notExistsUserByEmailKey = 'NotExistsUserByEmail';

@ValidatorConstraint({ name: notExistsUserByEmailKey, async: true })
@Injectable()
export class NotExistsUserByEmailRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByEmail(value);

    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    return this.makeMessageError(args.value);
  }

  private makeMessageError(text) {
    return `A user with the email: ${text} exist`;
  }
}
