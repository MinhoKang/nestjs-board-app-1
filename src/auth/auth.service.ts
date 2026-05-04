import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserCredentialDto } from './dto/user-credential.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userCredentialDto: UserCredentialDto): Promise<void> {
    await this.userRepository.createUser(userCredentialDto);
  }
}
