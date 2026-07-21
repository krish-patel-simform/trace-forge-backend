import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
};
