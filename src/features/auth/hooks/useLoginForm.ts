import { useState } from 'react';
import { z, type ZodIssue } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
    // 데이터 임시 입력
    const [form, setForm] = useState<LoginFormData>({
        email: 'skdud4659@gmail.com',
        password: 'Test@1234',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof LoginFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleClear = (field: keyof LoginFormData) => {
        setForm(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        try {
            loginSchema.parse(form);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.issues.forEach((e: ZodIssue) => {
                    newErrors[e.path[0] as string] = e.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const isFormValid = form.email.length > 0 && form.password.length > 0;

    const handleSubmit = (onSuccess?: () => void) => {
        if (!validateForm()) return;
        setIsLoading(true);
        setTimeout(() => {
            console.log('로그인 데이터', form);
            setIsLoading(false);
            if (onSuccess) onSuccess();
        }, 1000);
    };

    return {
        form,
        errors,
        isFormValid,
        isLoading,
        handleChange,
        handleClear,
        handleSubmit,
    };
};
