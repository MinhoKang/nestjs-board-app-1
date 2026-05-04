import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class DefaultCredentialDto {
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 영어 소문자와 대문자, 숫자로 구성되어야 합니다.',
  })
  password!: string;
}

export class SignUpDto extends DefaultCredentialDto {
  @IsString()
  nickname!: string;
}

export class SignInDto extends DefaultCredentialDto {}
