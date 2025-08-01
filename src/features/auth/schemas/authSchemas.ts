import { z } from 'zod';

export const emailSchema = z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .min(1, '이메일을 입력해주세요');

export const passwordSchema = z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, '비밀번호는 영문, 숫자 포함 8자 이상이어야 합니다.');

export const signupSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: '비밀번호가 일치하지 않습니다',
        path: ['confirmPassword'],
    });

export type SignupFormData = z.infer<typeof signupSchema>;
