import { TAuthMethods } from '../types/auth-methods.type';

export const AUTH_METHODS: TAuthMethods[] = [
  'plain',
  'hash',
  'hash-newline',
] as const;
