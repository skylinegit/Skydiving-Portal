import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
  changePasswordSchema,
} from './validation';

describe('loginSchema', () => {
  it('rejects empty fields', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'whatever' });
    expect(result.success).toBe(false);
  });

  it('accepts a well-formed payload', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'whatever' });
    expect(result.success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('requires a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects short passwords', () => {
    const result = resetPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'longenough',
      confirmPassword: 'different!',
    });
    expect(result.success).toBe(false);
  });

  it('accepts matching valid passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'longenough123',
      confirmPassword: 'longenough123',
    });
    expect(result.success).toBe(true);
  });
});

describe('changePasswordSchema', () => {
  it('rejects when current password is empty', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'longenough',
      confirmPassword: 'longenough',
    });
    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  const valid = {
    phone: '07800123456',
    dob: '2000-01-01',
    sex: 'male',
    fundraisingUrl: '',
    heightFeet: 5,
    heightInches: 11,
    weightStone: 12,
    weightPounds: 0,
    termsAccepted: true,
  } as const;

  it('accepts a valid profile', () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when terms are not accepted', () => {
    const result = profileSchema.safeParse({ ...valid, termsAccepted: false });
    expect(result.success).toBe(false);
  });

  it('rejects an http URL', () => {
    const result = profileSchema.safeParse({
      ...valid,
      fundraisingUrl: 'http://justgiving.com/yourname',
    });
    expect(result.success).toBe(false);
  });

  it('accepts an https URL', () => {
    const result = profileSchema.safeParse({
      ...valid,
      fundraisingUrl: 'https://justgiving.com/yourname',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-UK phone format', () => {
    const result = profileSchema.safeParse({ ...valid, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects inches outside 0-11', () => {
    const result = profileSchema.safeParse({ ...valid, heightInches: 12 });
    expect(result.success).toBe(false);
  });

  it('rejects pounds outside 0-13', () => {
    const result = profileSchema.safeParse({ ...valid, weightPounds: 14 });
    expect(result.success).toBe(false);
  });
});
