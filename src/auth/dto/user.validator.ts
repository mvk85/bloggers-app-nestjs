import { Length, Matches } from 'class-validator';
import { regexEmail } from 'src/const';
import { IsNotEmptyString } from 'src/decorators/is-not-empty-string.decorator';
import { NotExistsUserByEmail } from 'src/decorators/not-exist-user-email.decorator';
import { UserExistsByLogin } from 'src/decorators/user-exist-login.decorator';

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
