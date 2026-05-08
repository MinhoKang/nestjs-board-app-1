import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './dto/user-credential.dto';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser({ username, password, nickname }: SignUpDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      nickname,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
  }

  async updateHashedToken(id: number, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    try {
      await this.userRepository.update(id, { hashedRefreshToken });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException(`유저를 찾지 못했습니다.`);
    }

    return user;
  }

  async findUserByUsernameWithPassword(username: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new NotFoundException(`유저를 찾지 못했습니다.`);
    }

    return user;
  }

  async login(username: string): Promise<User> {
    const user = await this.findUserByUsername(username);

    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete({
      id,
    });
  }
}
