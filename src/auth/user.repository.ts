import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SignUpDto } from './dto/user-credential.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(signUpDto: SignUpDto): Promise<void> {
    const user = this.userRepository.create(signUpDto);

    await this.userRepository.save(user);
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException(`유저를 찾지 못했습니다.`);
    }

    return user;
  }

  async login(username: string): Promise<User> {
    const user = await this.findUserByUsername(username);

    return user;
  }
}
