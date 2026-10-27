import { describe, it, expect } from 'vitest';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  UserSettingsSchema,
  OrderSchema,
  PositionSchema,
  InstrumentSchema
} from '@trd/contracts';
import { registerUser, verifyCredentials, findUserByEmail } from '../src/lib/auth';

describe('Web Authentication and DTO Contracts', () => {
  it('validates correct login request schema', () => {
    const valid = { email: 'demo@trdpro.io', password: 'password123' };
    const res = LoginRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);

    const invalidEmail = { email: 'not-an-email', password: 'password123' };
    const invalidRes = LoginRequestSchema.safeParse(invalidEmail);
    expect(invalidRes.success).toBe(false);

    const shortPass = { email: 'demo@trdpro.io', password: '123' };
    const shortRes = LoginRequestSchema.safeParse(shortPass);
    expect(shortRes.success).toBe(false);
  });

  it('validates register request schema', () => {
    const valid = { name: 'Alex Trader', email: 'alex@trdpro.io', password: 'password123' };
    const res = RegisterRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);

    const shortName = { name: 'A', email: 'alex@trdpro.io', password: 'password123' };
    expect(RegisterRequestSchema.safeParse(shortName).success).toBe(false);
  });

  it('authenticates seeded demo user and registers new users', () => {
    // Demo user
    const demo = verifyCredentials('demo@trdpro.io', 'password123');
    expect(demo).not.toBeNull();
    expect(demo?.email).toBe('demo@trdpro.io');
    expect(demo?.role).toBe('pro');

    // Invalid credentials
    const invalid = verifyCredentials('demo@trdpro.io', 'wrong-pass');
    expect(invalid).toBeNull();

    // Register user
    const newUser = registerUser('Samantha Smith', 'samantha@investor.com', 'securepass123');
    expect(newUser.email).toBe('samantha@investor.com');
    expect(newUser.name).toBe('Samantha Smith');

    const verified = verifyCredentials('samantha@investor.com', 'securepass123');
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(newUser.id);
  });
});

