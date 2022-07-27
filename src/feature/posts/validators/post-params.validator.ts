import { PostExistsById } from '../decorators/post-exist.decorator';

export class PostParamsValidatorModel {
  @PostExistsById()
  id: string;
}
