import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bloggers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  youtubeUrl: string;
}
