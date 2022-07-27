import { Length, Matches } from 'class-validator';
import { regexEmail } from 'src/const';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';
import { NotExistsUserByEmail } from 'src/validators/not-exist-user-email.decorator';
import { UserExistsByLogin } from 'src/validators/user-exist-login.decorator';

export class UserValidatorModel {
  @IsNotEmptyString()
  @Length(3, 10)
  @UserExistsByLogin()
  login: string;

  @IsNotEmptyString()
  @Length(6, 20)
  password: string;

  @IsNotEmptyString()
  @Matches(regexEmail)
  @NotExistsUserByEmail()
  email: string;
}
