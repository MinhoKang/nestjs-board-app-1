import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  DeleteAccountDto,
  SignInDto,
  SignUpDto,
} from './dto/user-credential.dto';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private async validatePassword(username: string, plainPassword: string) {
    const user = await this.userRepository.findUserByUsername(username);
    const isSamePassword = await bcrypt.compare(plainPassword, user.password);

    if (!isSamePassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
  }

  async createUser(signUpDto: SignUpDto): Promise<void> {
    await this.userRepository.createUser(signUpDto);
  }

  async login({
    username,
    password,
  }: SignInDto): Promise<{ accessToken: string }> {
    await this.validatePassword(username, password);

    const payload = { username };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async deleteUser(
    { password, passwordConfirm }: DeleteAccountDto,
    user: User,
  ): Promise<void> {
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    await this.validatePassword(user.username, password);

    return this.userRepository.deleteUser(user.id);
  }
}
