import { Length } from 'class-validator';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';
import { ExistConfirmationCode } from '../decorators/exist-confirmation-code.decorator';
import { IsNotConfirmed } from '../decorators/is-not-confirmed.decorator';

export class RegistrationConfirmationValidatorModel {
  @IsNotEmptyString()
  @Length(1)
  @IsNotConfirmed()
  @ExistConfirmationCode()
  code: string;
}
