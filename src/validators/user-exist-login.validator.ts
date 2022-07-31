import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from 'src/feature/users/users.repository';

export const userExistByLoginKey = 'UserExistByLogin';

@ValidatorConstraint({ name: userExistByLoginKey, async: true })
@Injectable()
export class UserExistsByLoginRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

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
