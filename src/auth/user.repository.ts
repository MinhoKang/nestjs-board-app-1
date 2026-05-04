import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserCredentialDto } from './dto/user-credential.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userCredentialDto: UserCredentialDto): Promise<void> {
    const user = this.userRepository.create(userCredentialDto);

    await this.userRepository.save(user);
  }
}
