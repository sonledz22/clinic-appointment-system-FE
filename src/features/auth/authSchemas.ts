import { z } from 'zod';

const optionalTextSchema = z.string().trim().optional();

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự.'),
    email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
    phoneNumber: optionalTextSchema,
    dateOfBirth: optionalTextSchema,
    gender: optionalTextSchema,
    contactInformation: optionalTextSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
});

export const getValidationFieldErrors = <FieldName extends string>(error: z.ZodError) => {
  const fieldErrors: Partial<Record<FieldName, string>> = {};

  error.issues.forEach((issue) => {
    const fieldName = issue.path[0];
    if (typeof fieldName !== 'string') {
      return;
    }

    const typedFieldName = fieldName as FieldName;
    fieldErrors[typedFieldName] ??= issue.message;
  });

  return fieldErrors;
};

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
