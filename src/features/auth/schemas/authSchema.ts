import { z } from 'zod'

export const emailSchema = z.email({ error: 'Enter a valid email address.' })

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.').max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
