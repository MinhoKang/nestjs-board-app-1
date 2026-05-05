import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum BoardStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export class BoardDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(BoardStatus)
  status!: BoardStatus;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsEnum(BoardStatus)
  status?: BoardStatus;
}
