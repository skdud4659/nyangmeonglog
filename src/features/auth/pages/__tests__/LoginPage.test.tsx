import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginPage from '../LoginPage';
import { ROUTE_PATH } from '@/routes/constant';

const navigateMock = vi.fn();
const signInWithPasswordMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => navigateMock,
}));

vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: (...args: unknown[]) => signInWithPasswordMock(...args),
        },
    },
}));

describe('LoginPage (통합 테스트)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('이메일/비밀번호 입력 필드와 로그인 버튼을 렌더링한다', () => {
        render(<LoginPage />);

        expect(screen.getByText('이메일')).toBeInTheDocument();
        expect(screen.getByText('비밀번호')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('사용자가 이메일과 비밀번호를 입력하면 로그인 버튼이 활성화된다', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('이메일을 입력하세요');
        const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
        const loginButton = screen.getByRole('button', { name: '로그인' });

        expect(loginButton).toBeDisabled();

        await user.type(emailInput, 'user@test.com');
        await user.type(passwordInput, 'password123');

        expect(loginButton).toBeEnabled();
    });

    it('올바르지 않은 이메일 형식으로 제출하면 에러 메시지를 표시하고 API를 호출하지 않는다', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('이메일을 입력하세요');
        const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
        const loginButton = screen.getByRole('button', { name: '로그인' });

        await user.type(emailInput, 'invalid-email');
        await user.type(passwordInput, 'password123');

        // form submit 직접 트리거
        const form = screen.getByRole('button', { name: '로그인' }).closest('form')!;
        await act(async () => {
            fireEvent.submit(form);
        });

        await waitFor(() => {
            expect(screen.getByText(/올바른 이메일 형식이 아닙니다/i)).toBeInTheDocument();
        });

        expect(signInWithPasswordMock).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('유효한 입력으로 로그인에 성공하면 메인 홈으로 네비게이션된다', async () => {
        const user = userEvent.setup();

        signInWithPasswordMock.mockResolvedValue({
            data: {
                session: { user: { id: 'user-123', email: 'user@test.com' } },
                user: { id: 'user-123', email: 'user@test.com' },
            },
            error: null,
        });

        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('이메일을 입력하세요');
        const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
        const loginButton = screen.getByRole('button', { name: /로그인/ });

        await user.type(emailInput, 'user@test.com');
        await user.type(passwordInput, 'password123');
        await user.click(loginButton);

        await waitFor(() => {
            expect(signInWithPasswordMock).toHaveBeenCalledTimes(1);
            expect(navigateMock).toHaveBeenCalledWith({ to: ROUTE_PATH.MAIN.HOME });
        });
    });
});



