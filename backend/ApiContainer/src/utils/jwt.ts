import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * PUBLIC_INTERFACE
 * Signs a payload into a JWT access token.
 */
export function signAccessToken(payload: Record<string, unknown>, expiresIn = '15m'): string {
  /** Create a signed JWT with default 15 minutes expiry. */
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * PUBLIC_INTERFACE
 * Signs a payload into a refresh token.
 */
export function signRefreshToken(payload: Record<string, unknown>, expiresIn = '7d'): string {
  /** Create a signed refresh token with default 7 days expiry. */
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * PUBLIC_INTERFACE
 * Verifies a token and returns the decoded payload if valid.
 */
export function verifyToken<T = any>(token: string): T {
  /** Verify JWT signature and expiry. Throws on invalid token. */
  return jwt.verify(token, env.JWT_SECRET) as T;
}
