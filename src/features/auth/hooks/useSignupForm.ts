import { type SignupFormData, signupSchema } from '@/features/auth/schemas/authSchemas';
import { useState } from 'react';
import { z, type ZodIssue } from 'zod';

export const useSignupForm = () => {
    const [form, setForm] = useState<SignupFormData>({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof SignupFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        try {
            signupSchema.parse(form);
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

    const isFormValid =
        form.email &&
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password) &&
        form.confirmPassword === form.password;

    const handleSubmit = (onSuccess?: () => void) => {
        if (!validateForm()) return;
        setIsLoading(true);
        setTimeout(() => {
            console.log('회원가입 데이터', form);
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
        handleSubmit,
    };
};
