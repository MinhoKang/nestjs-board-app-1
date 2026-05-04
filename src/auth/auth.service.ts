import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SignInDto, SignUpDto } from './dto/user-credential.dto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(signUpDto: SignUpDto): Promise<void> {
    await this.userRepository.createUser(signUpDto);
  }

  async login({ username, password }: SignInDto): Promise<User> {
    const user = await this.userRepository.login(username);

    if (user.password !== password) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    return user;
  }
}
