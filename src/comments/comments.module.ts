import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AuthModule } from '@/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { CommentsRepository } from './comments.repository';
import { BoardRepository } from '@/board/board.repository';
import { Board } from '@/board/board.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Comment, Board])],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, BoardRepository],
})
export class CommentsModule {}
