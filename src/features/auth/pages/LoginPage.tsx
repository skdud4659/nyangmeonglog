import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { ROUTE_PATH } from '@/routes/constant';
import Button from '@/shared/components/atoms/Button';
import InputField from '@/shared/components/molecules/InputField';
import { useNavigate } from '@tanstack/react-router';

const LoginPage = () => {
    const { form, errors, isFormValid, isLoading, handleChange, handleClear, handleSubmit } =
        useLoginForm();

    const navigate = useNavigate();
    const onSubmit = () => {
        handleSubmit(onSuccess);
    };
    const onSuccess = () => {
        navigate({ to: ROUTE_PATH.HOME });
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

            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="flex flex-col gap-8"
            >
                <InputField
                    label="이메일"
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onClear={() => handleClear('email')}
                    placeholder="이메일을 입력하세요"
                    error={errors.email}
                />
                <InputField
                    label="비밀번호"
                    type="password"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onClear={() => handleClear('password')}
                    placeholder="비밀번호를 입력하세요"
                    error={errors.password}
                />

                <Button
                    type="submit"
                    label={isLoading ? '로그인 중...' : '로그인'}
                    disabled={!isFormValid || isLoading}
                />
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
