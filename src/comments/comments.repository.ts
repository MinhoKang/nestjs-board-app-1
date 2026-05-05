import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Repository } from 'typeorm';
import { CommentDto } from './dto/comment.dto';
import { Board } from '@/board/board.entity';
import { User } from '@/auth/user.entity';

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    username: string;
  };
}

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async getComments(id: number): Promise<CommentResponse[]> {
    const comments = await this.commentRepository.find({
      where: { post: { id } },
      relations: {
        user: true,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          id: true,
          username: true,
        },
      },
    });

    return comments.map((comment) =>
      this.toCommentResponse(comment, comment.user),
    );
  }

  async createComment(
    id: number,
    { content }: CommentDto,
    user: User,
  ): Promise<CommentResponse> {
    const post = await this.boardRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('게시글을 찾지 못했습니다.');
    }

    const comment = this.commentRepository.create({
      post,
      content,
      user,
    });

    const savedComment = await this.commentRepository.save(comment);

    return this.toCommentResponse(savedComment, user);
  }

  private toCommentResponse(comment: Comment, user: User): CommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
}
