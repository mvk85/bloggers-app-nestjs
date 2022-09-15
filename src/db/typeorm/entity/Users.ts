import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  passwordHash: string;

  @Column()
  isConfirmed: boolean;

  @Column({ nullable: true })
  confirmCode: string;

  @Column()
  login: string;

  @Column()
  email: string;
}
