import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Comment } from './comments.entity';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getComments(id: number): Promise<Comment[]> {
    return this.commentsRepository.getComments(id);
  }

  async createComment(id: number, commentDto: CommentDto) {
    return this.commentsRepository.createComment(id, commentDto);
  }
}
