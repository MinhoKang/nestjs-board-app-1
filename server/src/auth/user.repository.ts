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
import type { TSignIngFlowValues } from './types/signin-flows.type';
import type { TAuthMethodsValues } from './types/auth-methods.type';

type TCreateUserInput = SignUpDto & {
  authFlow: TSignIngFlowValues;
  authMethod: TAuthMethodsValues;
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserInput: TCreateUserInput): Promise<void> {
    const user = this.userRepository.create(createUserInput);

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

  async findUserWithPasswordByUsername(username: string): Promise<User> {
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

  async findUserWithUsernameAndPassword(
    username: string,
    password: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username, password },
    });

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
