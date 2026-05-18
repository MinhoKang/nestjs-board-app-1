import { IsIn } from 'class-validator';
import { SIGNIN_FLOWS } from '../constants/signin-flows.constant';
import type { TSignIngFlowValues } from '../types/signin-flows.type';

export class SignInFlowDto {
  @IsIn(SIGNIN_FLOWS)
  flow!: TSignIngFlowValues;
}
