import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/user-credential.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    return this.authService.createUser(signUpDto);
  }

  @Post('signin')
  signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }
}
