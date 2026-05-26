import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(80, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(80, 'Last name is too long'),
    email: emailSchema,
    bookingReference: z
      .string()
      .min(1, 'Booking reference is required')
      .max(64, 'Booking reference is too long'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
});
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const ukPhoneRegex = /^(?:\+?44|0)\s?\d(?:[\s-]?\d){8,9}$/;
const httpsUrl = z
  .string()
  .url('Enter a valid URL')
  .refine((value) => value.startsWith('https://'), 'URL must start with https://');

export const profileSchema = z.object({
  phone: z.string().regex(ukPhoneRegex, 'Enter a valid UK phone number'),
  dob: z.string().min(1, 'Date of birth is required'),
  sex: z.enum(['male', 'female', 'prefer-not-to-say']),
  fundraisingUrl: z.union([z.literal(''), httpsUrl]).optional(),
  heightFeet: z.coerce.number().min(3, 'Height must be realistic').max(8, 'Height must be realistic'),
  heightInches: z.coerce
    .number()
    .min(0, 'Inches must be between 0 and 11')
    .max(11, 'Inches must be between 0 and 11'),
  weightStone: z.coerce.number().min(5, 'Weight must be realistic').max(40, 'Weight must be realistic'),
  weightPounds: z.coerce
    .number()
    .min(0, 'Pounds must be between 0 and 13')
    .max(13, 'Pounds must be between 0 and 13'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const venueChangeSchema = z.object({
  newVenueId: z.string().min(1, 'Select a venue'),
});
export type VenueChangeInput = z.infer<typeof venueChangeSchema>;

export const datesChangeSchema = z.object({
  date1: z.string().min(1, 'Choose a preferred date'),
  date2: z.string().optional(),
});
export type DatesChangeInput = z.infer<typeof datesChangeSchema>;
