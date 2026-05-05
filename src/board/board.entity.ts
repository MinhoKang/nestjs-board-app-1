import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardStatus } from './dto/board.dto';

@Entity()
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column({ type: 'enum', enum: BoardStatus, default: BoardStatus.PUBLIC })
  status!: BoardStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
