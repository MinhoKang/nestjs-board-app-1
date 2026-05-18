import { SIGNIN_FLOWS } from '../constants/signin-flows.constant';

export type TSignInFlows = 'combined' | 'separated';
export type TSignIngFlowValues = (typeof SIGNIN_FLOWS)[number];
