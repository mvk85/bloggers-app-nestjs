import { Length } from 'class-validator';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';

export class UserSignInValidatorModel {
  @IsNotEmptyString()
  @Length(3, 10)
  login: string;

  @IsNotEmptyString()
  @Length(6, 20)
  password: string;
}
