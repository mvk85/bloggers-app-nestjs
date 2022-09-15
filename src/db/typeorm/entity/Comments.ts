import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from './Posts';
import { Users } from './Users';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  addedAt: Date;

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;

  @ManyToOne(() => Posts, (post) => post.id)
  post: Posts;
}
