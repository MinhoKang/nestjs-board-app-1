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
import { TSignIngFlowValues } from './types/signin-flows.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private transformPassword(password: string, method: TAuthMethods) {
    switch (method) {
      case 'plain':
        return password;

      case 'hash':
        return sha256(password);

      case 'hash-newline':
        return sha256(`${password}\n`);
    }
  }

  private async validatePassword(username: string, password: string) {
    const user =
      await this.userRepository.findUserWithPasswordByUsername(username);
    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return user;
  }

  // 비밀번호 bcrypt 비교
  private async assertPasswordMatches(
    inputPassword: string,
    storedPassword: string,
  ) {
    const isSamePassword = await bcrypt.compare(inputPassword, storedPassword);

    if (!isSamePassword)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
  }

  private async hashWithBcrypt(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async createUser(
    signUpDto: SignUpDto,
    flow: TSignIngFlowValues,
    method: TAuthMethodsValues,
  ): Promise<void> {
    const transformedPassword = this.transformPassword(
      signUpDto.password,
      method,
    );

    const passwordToSave =
      flow === 'combined'
        ? transformedPassword
        : await this.hashWithBcrypt(transformedPassword);

    return this.userRepository.createUser({
      ...signUpDto,
      password: passwordToSave,
      authFlow: flow,
      authMethod: method,
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

  async login(
    { username, password }: SignInDto,
    flow: TSignIngFlowValues,
    method: TAuthMethodsValues,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const transformedPassword = this.transformPassword(password, method);
    let user: User;

    if (flow === 'combined') {
      user = await this.userRepository.findUserWithUsernameAndPassword(
        username,
        transformedPassword,
      );
    } else {
      user = await this.userRepository.findUserWithPasswordByUsername(username);
      await this.assertPasswordMatches(transformedPassword, user.password);
    }

    if (user.authFlow !== flow || user.authMethod !== method) {
      throw new BadRequestException('가입한 인증 방식과 일치하지 않습니다.');
    }

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

    const {
      authFlow,
      authMethod,
      id,
      password: userPassword,
    } = await this.userRepository.findUserWithPasswordByUsername(user.username);

    const transformedPassword = this.transformPassword(password, authMethod);

    if (authFlow === 'combined') {
      if (transformedPassword !== userPassword) {
        throw new BadRequestException('비밀번호가 일치하지 않습니다');
      }
    } else {
      await this.assertPasswordMatches(transformedPassword, userPassword);
    }

    return this.userRepository.deleteUser(id);
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
