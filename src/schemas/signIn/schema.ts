import { z } from 'zod';

export const signInSchema = z.object({
    email: z.string().email('올바른 이메일 형식이어야 합니다.'),
    password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
