import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async getAllPosts(): Promise<Board[]> {
    return await this.boardRepository.find();
  }

  async createPost({ title, content, status }: BoardDto): Promise<Board> {
    const board = this.boardRepository.create({
      title,
      content,
      status,
    });

    await this.boardRepository.save(board);

    return board;
  }

  async deletePost(id: number): Promise<void> {
    await this.boardRepository.delete({ id });
  }

  async updatePost(id: number, updatePostDto: UpdateBoardDto): Promise<Board> {
    const post = await this.boardRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    Object.assign(post, updatePostDto);
    await this.boardRepository.save(post);

    return post;
  }
}
