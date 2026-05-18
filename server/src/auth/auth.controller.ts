import {
  Body,
  Controller,
  Delete,
  Param,
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
import type { TAuthMethodsValues } from './types/auth-methods.type';
import type { TSignIngFlowValues } from './types/signin-flows.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:flow/:method')
  signUp(
    @Body(ValidationPipe) signUpDto: SignUpDto,
    @Param('flow') flow: TSignIngFlowValues,
    @Param('method') method: TAuthMethodsValues,
  ) {
    return this.authService.createUser(signUpDto, flow, method);
  }

  @Post('signin/:flow/:method')
  signIn(
    @Body(ValidationPipe) signInDto: SignInDto,
    @Param('flow') flow: TSignIngFlowValues,
    @Param('method') method: TAuthMethodsValues,
  ) {
    return this.authService.login(signInDto, flow, method);
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
