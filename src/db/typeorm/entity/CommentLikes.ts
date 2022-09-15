import { LikeItemType } from 'src/db/types';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Comments } from './Comments';
import { Users } from './Users';

@Entity()
export class CommentLikes {
  @Column()
  addedAt: Date;

  @Column({
    type: 'enum',
    enum: LikeItemType,
  })
  likeStatus: LikeItemType;

  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  commentId: string;

  @ManyToOne(() => Comments, (comment) => comment.id)
  comment: Comments;

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;
}
