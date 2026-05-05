import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardDto, UpdateBoardDto } from './dto/board.dto';
import { User } from '@/auth/user.entity';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async getAllPosts(): Promise<Board[]> {
    return await this.boardRepository.find();
  }

  async getMyPosts(id: number): Promise<Board[]> {
    return await this.boardRepository.find({ where: { user: { id } } });
  }

  async createPost(
    { title, content, status }: BoardDto,
    user: User,
  ): Promise<Board> {
    const board = this.boardRepository.create({
      title,
      content,
      status,
      user,
    });

    await this.boardRepository.save(board);

    return board;
  }

  async deletePost(id: number, user: User): Promise<void> {
    await this.boardRepository.delete({ id, user: { id: user.id } });
  }

  async updatePost(
    id: number,
    updatePostDto: UpdateBoardDto,
    user: User,
  ): Promise<Board> {
    const post = await this.boardRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.user.id !== user.id) {
      throw new BadRequestException('작성자만 수정이 가능합니다');
    }

    Object.assign(post, updatePostDto);
    await this.boardRepository.save(post);

    return post;
  }
}
