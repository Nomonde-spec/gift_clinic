import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUserPayload } from '../types';

export const signJwt = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const verifyJwt = (token: string): AuthUserPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthUserPayload;
  } catch (error) {
    return null;
  }
};
