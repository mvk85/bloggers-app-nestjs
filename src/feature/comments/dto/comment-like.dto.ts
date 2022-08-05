import { IsEnum } from 'class-validator';
import { LikesStatus } from 'src/db/types';

export class CommentLikeDto {
  @IsEnum(LikesStatus)
  likeStatus: LikesStatus;
}
