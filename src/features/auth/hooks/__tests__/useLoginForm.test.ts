import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLoginForm } from '../useLoginForm';
import { supabase } from '@/shared/lib/supabase';

// Supabase mock
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}));

describe('useLoginForm', () => {
    beforeEach(() => {
        // 각 테스트 전에 mock 초기화
        vi.clearAllMocks();
    });

    it('초기 상태가 올바르게 설정된다', () => {
        // Arrange & Act
        const { result } = renderHook(() => useLoginForm());

        // Assert
        expect(result.current.form).toEqual({
            email: '',
            password: '',
        });
        expect(result.current.errors).toEqual({});
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFormValid).toBe(false);
    });

    it('handleChange로 이메일을 변경할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
        });

        // Assert
        expect(result.current.form.email).toBe('test@example.com');
    });

    it('handleChange로 비밀번호를 변경할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('password', 'password123');
        });

        // Assert
        expect(result.current.form.password).toBe('password123');
    });

    it('handleClear로 필드를 초기화할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
        });

        act(() => {
            result.current.handleClear('email');
        });

        // Assert
        expect(result.current.form.email).toBe('');
        expect(result.current.form.password).toBe('password123');
    });

    it('이메일과 비밀번호가 모두 입력되면 isFormValid가 true가 된다', () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
        });

        // Assert
        expect(result.current.isFormValid).toBe(true);
    });

    it('잘못된 이메일 형식은 에러를 반환한다', async () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'invalid-email');
            result.current.handleChange('password', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // Assert
        expect(result.current.errors.email).toBeDefined();
        expect(result.current.errors.email).toContain('이메일');
    });

    it('8자 미만 비밀번호는 에러를 반환한다', async () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', '1234567'); // 7자
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        // Assert
        expect(result.current.errors.password).toBeDefined();
        expect(result.current.errors.password).toContain('8자');
    });

    it('유효한 폼으로 로그인에 성공하면 onSuccess가 호출된다', async () => {
        // Arrange
        const mockSession = { user: { id: '123' }, access_token: 'token' };
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { session: mockSession, user: { id: '123' } },
            error: null,
        } as any);

        const { result } = renderHook(() => useLoginForm());
        const onSuccess = vi.fn();

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
        });

        await act(async () => {
            await result.current.handleSubmit(onSuccess);
        });

        // Assert
        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('로그인 실패 시 에러 메시지가 설정된다', async () => {
        // Arrange
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { session: null, user: null },
            error: { message: 'Invalid login credentials' },
        } as any);

        const { result } = renderHook(() => useLoginForm());

        // Act
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', 'password123');
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

    it('필드 변경 시 해당 필드의 에러가 클리어된다', async () => {
        // Arrange
        const { result } = renderHook(() => useLoginForm());

        // Act - 먼저 에러 발생시키기
        act(() => {
            result.current.handleChange('email', 'test@example.com');
            result.current.handleChange('password', '123'); // 짧은 비밀번호
        });

        await act(async () => {
            await result.current.handleSubmit(); // 에러 발생
        });

        // 에러가 설정되었는지 확인
        expect(result.current.errors.password).toBeDefined();

        // 에러가 있는 상태에서 필드 변경
        act(() => {
            result.current.handleChange('password', 'newpassword123');
        });

        // Assert - 에러가 클리어됨
        expect(result.current.errors.password).toBe('');
    });
});
