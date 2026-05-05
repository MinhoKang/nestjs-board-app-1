import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { GetUser } from '@/auth/get-user-decorator';
import { User } from '@/auth/user.entity';
import { CommentDto } from './dto/comment.dto';

@Controller('comments')
@UseGuards(AuthGuard())
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('/:id')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getComments(id);
  }

  @Post('/:id')
  async createComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() commentDto: CommentDto,
  ) {
    return this.commentsService.createComment(id, commentDto);
  }
}
