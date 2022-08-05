import { PostExistsById } from '../decorators/post-exist.decorator';

export class PostIdParamValidatorModel {
  @PostExistsById()
  id: string;
}
