import { Matches } from 'class-validator';
import { regexEmail } from 'src/const';
import { ExistsUserByEmail } from 'src/validators/exist-user-email.decorator';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';
import { IsNotConfirmedByEmail } from '../decorators/is-not-confirmed-by-emal.decorator';

export class RegistrationEmailResendingValidatorModel {
  @IsNotEmptyString()
  @Matches(regexEmail)
  @ExistsUserByEmail()
  @IsNotConfirmedByEmail()
  email: string;
}
