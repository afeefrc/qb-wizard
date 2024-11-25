import crypto from 'crypto';
import { hash, compare } from 'bcryptjs';

export const generateRandomString = (length: number): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(password, hashedPassword);
};

// ... other crypto functions ...
