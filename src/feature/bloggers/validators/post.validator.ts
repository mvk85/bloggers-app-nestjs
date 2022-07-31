import { Length } from 'class-validator';
import { IsNotEmptyString } from 'src/decorators/is-not-empty-string.decorator';

export class PostValidatorModel {
  @IsNotEmptyString()
  @Length(1, 30)
  title: string;

  @IsNotEmptyString()
  @Length(1, 100)
  shortDescription: string;

  @IsNotEmptyString()
  @Length(1, 1000)
  content: string;
}
