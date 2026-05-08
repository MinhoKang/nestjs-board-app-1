import {
  Body,
  Controller,
  Delete,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  DeleteAccountDto,
  SignInDto,
  SignUpDto,
} from './dto/user-credential.dto';
import { GetUser } from './get-user-decorator';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

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

  @Delete('/delete')
  @UseGuards(AuthGuard())
  deleteUser(
    @Body() deleteAccountDto: DeleteAccountDto,
    @GetUser() user: User,
  ) {
    return this.authService.deleteUser(deleteAccountDto, user);
  }

  @Post('/refresh')
  @UseGuards(AuthGuard())
  refreshToken(@GetUser() user: User) {
    console.log('user', user);

    return this.authService.refreshToken(user);
  }
}
