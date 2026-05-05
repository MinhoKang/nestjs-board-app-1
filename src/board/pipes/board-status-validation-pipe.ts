import { BadRequestException, PipeTransform } from '@nestjs/common';
import { BoardStatus } from '../dto/board.dto';

export class BoardStatusValidationPipe implements PipeTransform {
  private readonly StatusOptions = [BoardStatus.PRIVATE, BoardStatus.PUBLIC];

  transform(value: string) {
    value = value.toUpperCase();

    if (!this.isValidStatus(value)) {
      throw new BadRequestException('stauts는 지정된 값만 가능합니다.');
    }

    return value;
  }

  private isValidStatus(value: any): boolean {
    const isValid = this.StatusOptions.includes(value);

    return isValid;
  }
}
