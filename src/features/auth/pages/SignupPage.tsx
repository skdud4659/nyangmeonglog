import { useSignupForm } from '@/features/auth/hooks/useSignupForm';
import InputField from '@/shared/components/molecules/InputField';
import { motion } from 'framer-motion';
import { useState } from 'react';

const SignupPage = () => {
    const { form, errors, isFormValid, isLoading, handleChange, handleSubmit } = useSignupForm();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <header className="pt-20 pb-16 px-6">
                <h1 className="text-3xl text-gray_9 font-bold">
                    <p>반가워요! 🐶 🐱</p>
                    <p>냥멍일지</p>
                    <p>회원가입을 해주세요</p>
                </h1>
            </header>

            <main className="flex-1 pb-28 px-6 overflow-y-auto">
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <InputField
                        label="이메일 입력"
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        onClear={() => handleChange('email', '')}
                        error={errors.email}
                    />
                    <InputField
                        label="비밀번호 입력"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => handleChange('password', e.target.value)}
                        onClear={() => handleChange('password', '')}
                        error={errors.password}
                        showPasswordToggle
                        onTogglePassword={() => setShowPassword(prev => !prev)}
                    />
                    <InputField
                        label="비밀번호 확인"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                        onClear={() => handleChange('confirmPassword', '')}
                        error={errors.confirmPassword}
                        success={
                            form.confirmPassword.length > 0 &&
                            form.confirmPassword === form.password
                        }
                        showPasswordToggle
                        onTogglePassword={() => setShowConfirmPassword(prev => !prev)}
                    />
                </form>
            </main>

            <div className="sticky bottom-0">
                <motion.button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    onClick={() => handleSubmit()}
                    className={`w-full py-4 rounded-none font-semibold ${
                        isFormValid && !isLoading
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-gray_2 text-gray_5 cursor-not-allowed'
                    }`}
                    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                >
                    {isLoading ? '가입 중...' : '다음페이지'}
                </motion.button>
            </div>
        </div>
    );
};

export default SignupPage;
