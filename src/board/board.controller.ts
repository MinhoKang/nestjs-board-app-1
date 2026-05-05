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
import { GetUser } from '@/auth/get-user-decorator';
import { User } from '@/auth/user.entity';

@Controller('board')
@UseGuards(AuthGuard())
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async getAllPosts() {
    return await this.boardService.getAllPosts();
  }

  @Get('/my')
  async getMyPosts(@GetUser() user: User) {
    return await this.boardService.getMyPosts(user.id);
  }

  @Post()
  async createPost(@Body() boardDto: BoardDto, @GetUser() user: User) {
    return await this.boardService.createPost(boardDto, user);
  }

  @Patch(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updatePostDto: UpdateBoardDto,
    @GetUser() user: User,
  ) {
    return await this.boardService.updatePost(id, updatePostDto, user);
  }

  @Delete('/:id')
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return await this.boardService.deletePost(id, user);
  }
}
