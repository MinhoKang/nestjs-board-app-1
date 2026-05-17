import { AUTH_METHODS } from '../constants/auth-methods.constant';

export type TAuthMethods = 'plain' | 'hash' | 'hash-newline';
export type TAuthMethodsValues = (typeof AUTH_METHODS)[number];
