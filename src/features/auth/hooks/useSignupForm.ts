import { type SignupFormData, signupSchema } from '@/features/auth/schemas/authSchemas';
import { supabase } from '@/shared/lib/supabase';
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
        !!form.email &&
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password) &&
        form.confirmPassword === form.password;

    const handleSubmit = async (onSuccess?: () => void, onAutoLoginFailure?: () => void) => {
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
            });

            if (error) throw error;

            try {
                await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                });
            } catch {
                if (onAutoLoginFailure) onAutoLoginFailure();
                return;
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            let message = '회원가입에 실패했습니다';
            if (err && typeof err === 'object' && 'message' in err) {
                message = String((err as { message?: string }).message ?? message);
            }
            const newErrors: Record<string, string> = {};
            if (message.toLowerCase().includes('password')) newErrors.password = message;
            else if (message.toLowerCase().includes('email')) newErrors.email = message;
            else newErrors.email = message;
            setErrors(newErrors);
        } finally {
            setIsLoading(false);
        }
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
