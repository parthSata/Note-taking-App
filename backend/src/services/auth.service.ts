import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import type { LoginInput, RegisterInput } from '../validations/auth.schema';
import type { AuthUser } from '../types';

const BCRYPT_ROUNDS = 12;

function toAuthUser(user: { _id: { toString(): string }; name: string; email: string }): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
  });

  return toAuthUser(user);
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  return toAuthUser(user);
}
