import { IsIn } from 'class-validator';
import { AUTH_METHODS } from '../constants/auth-methods.constant';
import type { TAuthMethodsValues } from '../types/auth-methods.type';

export class AuthMethodsDto {
  @IsIn(AUTH_METHODS)
  method!: TAuthMethodsValues;
}
