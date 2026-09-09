// import jwt from 'jsonwebtoken';
// import { env } from '../config/env';
// import { JwtPayload } from '../types';

// export function generateAccessToken(payload: JwtPayload): string {
//   return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });
// }

// export function generateRefreshToken(payload: JwtPayload): string {
//   return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
// }

// export function verifyAccessToken(token: string): JwtPayload {
//   return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
// }

// export function verifyRefreshToken(token: string): JwtPayload {
//   return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
// }

import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

import { JwtPayload } from '../types';

export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.accessExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}