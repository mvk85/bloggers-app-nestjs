import { LikeItemType } from 'src/db/types';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Posts } from './Posts';
import { Users } from './Users';

@Entity()
export class PostLikes {
  @Column()
  addedAt: Date;

  @Column({
    type: 'enum',
    enum: LikeItemType,
  })
  likeStatus: LikeItemType;

  @PrimaryColumn()
  postId: string;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Posts, (post) => post.id, { onDelete: 'CASCADE' })
  post: Posts;

  @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
  user: Users;
}
