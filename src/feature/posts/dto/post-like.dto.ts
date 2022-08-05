import { IsEnum } from 'class-validator';
import { LikesStatus } from 'src/db/types';

export class PostLikeDto {
  @IsEnum(LikesStatus)
  likeStatus: LikesStatus;
}
