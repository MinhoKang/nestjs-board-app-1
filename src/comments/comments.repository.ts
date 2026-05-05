import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Repository } from 'typeorm';
import { CommentDto } from './dto/comment.dto';
import { Board } from '@/board/board.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async getComments(id: number): Promise<Comment[]> {
    return this.commentRepository.find({ where: { post: { id } } });
  }

  async createComment(id: number, { content }: CommentDto): Promise<Comment> {
    const post = await this.boardRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('게시글을 찾지 못했습니다.');
    }

    const comment = this.commentRepository.create({
      post,
      content,
    });

    await this.commentRepository.save(comment);

    return comment;
  }
}
