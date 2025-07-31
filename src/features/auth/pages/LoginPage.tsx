import { ROUTE_PATH } from '@/routes/constant';
import Button from '@/shared/components/atoms/Button';
import InputField from '@/shared/components/molecules/InputField';
import { motion } from 'framer-motion';
import { useState } from 'react';

const LoginPage = () => {
    const [form, setForm] = useState({ email: 'kmkmm0701@naver.com', password: '************' });
    const [error, setError] = useState('');

    const isFormValid = form.email.length > 0 && form.password.length > 0;

    const handleChange =
        (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => ({ ...prev, [field]: e.target.value }));
        };

    const handleClear = (field: 'email' | 'password') => () => {
        setForm(prev => ({ ...prev, [field]: '' }));
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        console.log('로그인 시도', form);
        // Firebase 로그인 로직
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans px-6">
            <header className="w-full max-w-sm my-20">
                <h1 className="text-3xl text-gray_9 font-bold">
                    <span className="block">우리 반려동물을 위한</span>
                    <span className="block">기록습관</span>
                    <span className="block">
                        <span>냥멍일지</span>
                        <span className="font-normal">에</span>
                    </span>
                    <span className="block font-normal">오신 것을 환영해요 🐶 🐱</span>
                </h1>
            </header>

            <form onSubmit={handleLogin} className="w-full max-w-sm">
                <InputField
                    label="이메일"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    onClear={handleClear('email')}
                    placeholder="이메일을 입력하세요"
                />
                <InputField
                    label="비밀번호"
                    type="password"
                    value={form.password}
                    onChange={handleChange('password')}
                    onClear={handleClear('password')}
                    placeholder="비밀번호를 입력하세요"
                />

                {error && (
                    <motion.p
                        className="text-red-500 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.p>
                )}

                <Button type="submit" label="로그인" disabled={!isFormValid} />
            </form>

            <div className="py-5">
                <div className="flex items-center justify-center space-x-2 text-sm">
                    <p className="text-gray_7">아직 계정이 없으신가요?</p>
                    <a
                        href={ROUTE_PATH.SIGNUP}
                        className="font-semibold text-gray_8 hover:underline"
                    >
                        회원가입
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
