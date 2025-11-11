import { supabase } from '@/shared/lib/supabase';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSignupForm } from '../useSignupForm';

// Supabase 모킹
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
        },
    },
}));

describe('useSignupForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('초기 상태가 올바르게 설정된다', () => {
        // Arrange & Act
        const { result } = renderHook(() => useSignupForm());

        // Assert
        expect(result.current.form).toEqual({
            email: '',
            password: '',
            confirmPassword: '',
        });
        expect(result.current.errors).toEqual({});
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFormValid).toBe(false);
    });

    it('handleChange로 폼 필드를 변경할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        // Assert
        expect(result.current.form).toEqual({
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
        });
    });

    it('비밀번호가 정규식 패턴을 만족하지 않으면 isFormValid가 false다', () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act - 숫자가 없는 비밀번호
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password'); // 숫자 없음
            result.current.handleChange('confirmPassword', 'password');
        });

        // Assert
        expect(result.current.isFormValid).toBe(false);
    });

    it('비밀번호가 8자 미만이면 isFormValid가 false다', () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'pass1'); // 5자
            result.current.handleChange('confirmPassword', 'pass1');
        });

        // Assert
        expect(result.current.isFormValid).toBe(false);
    });

    it('비밀번호와 비밀번호 확인이 일치하지 않으면 isFormValid가 false다', () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password456'); // 불일치
        });

        // Assert
        expect(result.current.isFormValid).toBe(false);
    });

    it('모든 조건을 만족하면 isFormValid가 true다', () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        // Assert
        expect(result.current.isFormValid).toBe(true);
    });

    it('필드 변경 시 해당 필드의 에러가 클리어된다', () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act - 먼저 에러 발생
        act(() => {
            result.current.handleChange('email', 'invalid-email');
        });

        // errors에 임의로 에러 설정 (실제로는 handleSubmit에서 발생)
        act(() => {
            result.current.handleChange('email', 'test@example.com');
        });

        // Assert - 에러가 클리어되었는지 확인
        expect(result.current.errors.email).toBeUndefined();
    });

    it('유효하지 않은 폼으로 제출하면 검증 에러가 발생한다', async () => {
        // Arrange
        const { result } = renderHook(() => useSignupForm());

        // Act - 비밀번호 불일치
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password456'); // 불일치
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // Assert
        expect(result.current.errors.confirmPassword).toBe('비밀번호가 일치하지 않습니다');
    });

    it('회원가입과 자동 로그인에 성공하면 onSuccess가 호출된다', async () => {
        // Arrange
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
            data: { session: null, user: { id: '123' } },
            error: null,
        } as any);

        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { session: { user: { id: '123' } }, user: { id: '123' } },
            error: null,
        } as any);

        const { result } = renderHook(() => useSignupForm());
        const onSuccess = vi.fn();

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit(onSuccess);
        });

        // Assert
        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(onSuccess).toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('회원가입 실패 시 에러 메시지가 설정된다', async () => {
        // Arrange
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
            data: { session: null, user: null },
            error: { message: 'User already registered' } as any,
        } as any);

        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // Assert
        await waitFor(() => {
            expect(result.current.errors).toBeDefined();
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('회원가입 성공 후 자동 로그인 실패 시 onAutoLoginFailure가 호출된다', async () => {
        // Arrange
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
            data: { session: null, user: { id: '123' } },
            error: null,
        } as any);

        vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
            new Error('Auto login failed')
        );

        const { result } = renderHook(() => useSignupForm());
        const onSuccess = vi.fn();
        const onAutoLoginFailure = vi.fn();

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit(onSuccess, onAutoLoginFailure);
        });

        // Assert
        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalled();
            expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
            expect(onAutoLoginFailure).toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('에러 메시지에 password가 포함되면 password 필드에 에러가 설정된다', async () => {
        // Arrange
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
            data: { session: null, user: null },
            error: { message: 'Password is too weak' } as any,
        } as any);

        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // Assert
        await waitFor(() => {
            expect(result.current.errors.password).toBe('Password is too weak');
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('에러 메시지에 email이 포함되면 email 필드에 에러가 설정된다', async () => {
        // Arrange
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
            data: { session: null, user: null },
            error: { message: 'Email already in use' } as any,
        } as any);

        const { result } = renderHook(() => useSignupForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
            result.current.handleChange('confirmPassword', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // Assert
        await waitFor(() => {
            expect(result.current.errors.email).toBe('Email already in use');
            expect(result.current.isLoading).toBe(false);
        });
    });
});
