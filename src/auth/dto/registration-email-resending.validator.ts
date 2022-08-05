import { Matches } from 'class-validator';
import { regexEmail } from 'src/const';
import { ExistsUserByEmail } from 'src/decorators/exist-user-email.decorator';
import { IsNotEmptyString } from 'src/decorators/is-not-empty-string.decorator';
import { IsNotConfirmedByEmail } from '../decorators/is-not-confirmed-by-emal.decorator';

export class RegistrationEmailResendingValidatorModel {
  @IsNotEmptyString()
  @Matches(regexEmail)
  @ExistsUserByEmail()
  @IsNotConfirmedByEmail()
  email: string;
}
