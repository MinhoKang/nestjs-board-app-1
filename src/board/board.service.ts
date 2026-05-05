import { Injectable } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { Board } from './board.entity';
import { BoardDto, UpdateBoardDto } from './dto/board.dto';
import { User } from '@/auth/user.entity';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getAllPosts(): Promise<Board[]> {
    return this.boardRepository.getAllPosts();
  }

  async getMyPosts(id: number): Promise<Board[]> {
    return this.boardRepository.getMyPosts(id);
  }

  async createPost(boardDto: BoardDto, user: User): Promise<Board> {
    return this.boardRepository.createPost(boardDto, user);
  }

  async deletePost(id: number, user: User): Promise<void> {
    await this.boardRepository.deletePost(id, user);
  }

  async updatePost(
    id: number,
    updatePostDto: UpdateBoardDto,
    user: User,
  ): Promise<Board> {
    return await this.boardRepository.updatePost(id, updatePostDto, user);
  }
}
