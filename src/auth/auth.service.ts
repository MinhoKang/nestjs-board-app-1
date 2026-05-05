import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SignInDto, SignUpDto } from './dto/user-credential.dto';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(signUpDto: SignUpDto): Promise<void> {
    await this.userRepository.createUser(signUpDto);
  }

  async login({
    username,
    password,
  }: SignInDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.login(username);

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const payload = { username };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
