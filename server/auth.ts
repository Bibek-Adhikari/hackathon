import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, User } from './db.ts';

// In-memory active tokens mapped to userId (or persistent)
const tokenMap = new Map<string, string>();

export function generateToken(userId: string): string {
  const token = 'chtk_' + crypto.randomBytes(24).toString('hex');
  tokenMap.set(token, userId);
  return token;
}

export function revokeToken(token: string): void {
  tokenMap.delete(token);
}

export function getUserIdFromToken(token: string): string | null {
  return tokenMap.get(token) || null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] as string);

  if (!token) {
    return next();
  }

  const userId = getUserIdFromToken(token);
  if (userId) {
    const user = db.getUserById(userId);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  next();
}
