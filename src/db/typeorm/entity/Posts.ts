import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Bloggers } from './Bloggers';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  addedAt: Date;

  @ManyToOne(() => Bloggers, (blogger) => blogger.id, { onDelete: 'CASCADE' })
  blogger: Bloggers;
}
