import { randomBytes } from 'crypto';

export function generateShareToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateAccessKey(): string {
  return randomBytes(16).toString('hex');
}
