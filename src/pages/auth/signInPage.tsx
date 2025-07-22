import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormData } from '@/schemas/signIn/schema';
import Input from '@/components/atoms/input';
import Button from '@/components/atoms/button';
import footPrint from '@/assets/icons/footPrint.svg';

const SignInPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = (data: SignInFormData) => {
        console.log('로그인 시도:', data);
    };

    return (
        <div className="min-h-screen px-4 py-11 flex flex-col">
            <h1 className="text-2xl text-left">
                <span className="font-bold">우리 반려동물을 위한</span>
                <br />
                <span className="font-bold">기록습관</span>
                <br />
                <span>
                    <span className="font-bold">냥멍로그</span>에 오신것을
                    <br />
                    환영해요 🐱🐶
                </span>
            </h1>
            <div className="mt-20 flex flex-col justify-center">
                <div className="flex flex-col gap-5">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <Input
                            label="이메일"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="비밀번호"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                        />
                        <Button
                            style={{ marginTop: '20px' }}
                            type="submit"
                            label="로그인"
                            size="lg"
                        />
                    </form>
                    <p className="text-sm text-center text-gray-500">
                        계정이 없으신가요?{' '}
                        <a href="/signup" className="text-pink-500 font-semibold">
                            회원가입
                        </a>
                    </p>
                </div>
            </div>
            <div className="flex-1 flex items-end justify-end">
                <Button label="다음 페이지" size="lg" shape="square">
                    <img src={footPrint} alt="다음 페이지" className="inline-block text-white" />
                </Button>
            </div>
        </div>
    );
};

export default SignInPage;
