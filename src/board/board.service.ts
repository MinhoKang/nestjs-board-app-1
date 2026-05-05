import { Injectable } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { Board } from './board.entity';
import { BoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getAllPosts(): Promise<Board[]> {
    return this.boardRepository.getAllPosts();
  }

  async createPost(boardDto: BoardDto): Promise<Board> {
    return this.boardRepository.createPost(boardDto);
  }

  async deletePost(id: number): Promise<void> {
    await this.boardRepository.deletePost(id);
  }

  async updatePost(id: number, updatePostDto: UpdateBoardDto): Promise<Board> {
    return await this.boardRepository.updatePost(id, updatePostDto);
  }
}
