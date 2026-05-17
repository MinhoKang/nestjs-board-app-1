import {
  BadRequestException,
  ForbiddenException,
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
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { TAuthMethodsValues, TAuthMethods } from './types/auth-methods.type';
import { sha256 } from './utils/hash';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private transfromPassword(password: string, method: TAuthMethods) {
    switch (method) {
      case 'plain':
        return password;

      case 'hash':
        return sha256(password);

      case 'hash-newline':
        return sha256(`${password}\n`);
    }
  }

  private async validatePassword(username: string, plainPassword: string) {
    const user =
      await this.userRepository.findUserByUsernameWithPassword(username);
    const isSamePassword = await bcrypt.compare(plainPassword, user.password);

    if (!isSamePassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
  }

  async createUser(
    signUpDto: SignUpDto,
    method: TAuthMethodsValues,
  ): Promise<void> {
    const transformedPassword = this.transfromPassword(
      signUpDto.password,
      method,
    );

    await this.userRepository.createUser({
      ...signUpDto,
      password: transformedPassword,
    });
  }

  private async getTokens(
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { username },
        {
          secret,
          expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
            'JWT_ACCESS_TOKEN_EXPIRESIN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { username },
        {
          secret,
          expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
            'JWT_REFRESH_TOKEN_EXPIRESIN',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login({
    username,
    password,
  }: SignInDto): Promise<{ accessToken: string; refreshToken: string }> {
    await this.validatePassword(username, password);
    const user = await this.userRepository.findUserByUsername(username);

    const tokens = await this.getTokens(username);
    await this.userRepository.updateHashedToken(user.id, tokens.refreshToken);

    return tokens;
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

  async refreshToken({
    id,
    username,
    hashedRefreshToken,
  }: User): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.getTokens(username);

    if (!hashedRefreshToken) {
      throw new ForbiddenException();
    }

    await this.userRepository.updateHashedToken(id, tokens.refreshToken);

    return tokens;
  }
}
