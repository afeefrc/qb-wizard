import { authenticator } from 'otplib';

export const generateSecret = (): string => {
  return authenticator.generateSecret();
};

export const verifyToken = (secret: string, token: string): boolean => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};
