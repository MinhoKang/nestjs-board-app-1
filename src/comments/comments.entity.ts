import { Board } from '@/board/board.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Board, (board) => board.comments, { eager: false })
  post!: Board;
}
