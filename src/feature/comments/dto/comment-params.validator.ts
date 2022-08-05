import { CommentExistsById } from '../decorators/coment-exist.decorator';

export class CommentParamsValidatorModel {
  @CommentExistsById()
  id: string;
}
