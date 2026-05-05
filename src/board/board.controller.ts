import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthGuard } from '@nestjs/passport';
import { BoardDto, UpdateBoardDto } from './dto/board.dto';

@Controller('board')
@UseGuards(AuthGuard())
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async getAllPosts() {
    return await this.boardService.getAllPosts();
  }

  @Post()
  async createPost(@Body() boardDto: BoardDto) {
    return await this.boardService.createPost(boardDto);
  }

  @Patch(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updatePostDto: UpdateBoardDto,
  ) {
    return await this.boardService.updatePost(id, updatePostDto);
  }

  @Delete('/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return await this.boardService.deletePost(id);
  }
}
