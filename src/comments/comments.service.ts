import { Injectable } from '@nestjs/common';
import { CommentResponse, CommentsRepository } from './comments.repository';
import { CommentDto } from './dto/comment.dto';
import { User } from '@/auth/user.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getComments(id: number): Promise<CommentResponse[]> {
    return this.commentsRepository.getComments(id);
  }

  async createComment(
    id: number,
    commentDto: CommentDto,
    user: User,
  ): Promise<CommentResponse> {
    return this.commentsRepository.createComment(id, commentDto, user);
  }
}
