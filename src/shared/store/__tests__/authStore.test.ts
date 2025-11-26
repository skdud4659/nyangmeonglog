import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// Supabase 모킹
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: () => mockGetSession(),
            onAuthStateChange: (callback: any) => mockOnAuthStateChange(callback),
            signOut: () => mockSignOut(),
        },
    },
}));

describe('authStore', () => {
    // 각 테스트 전에 스토어 상태 초기화 (테스트 간 오염 방지)
    beforeEach(() => {
        vi.clearAllMocks();

        // Zustand 스토어 초기화 패턴
        useAuthStore.setState({
            session: null,
            user: null,
            isInitialized: false,
        });
    });

    describe('초기 상태', () => {
        it('초기 상태가 올바르게 설정된다', () => {
            // Act
            const state = useAuthStore.getState();

            // Assert
            expect(state.session).toBeNull();
            expect(state.user).toBeNull();
            expect(state.isInitialized).toBe(false);
        });
    });

    describe('initialize', () => {
        it('세션이 없을 때 null로 초기화된다', async () => {
            // Arrange
            mockGetSession.mockResolvedValue({ data: { session: null } });
            mockOnAuthStateChange.mockImplementation(() => {});

            // Act
            await act(async () => {
                await useAuthStore.getState().initialize();
            });

            // Assert
            const state = useAuthStore.getState();
            expect(state.session).toBeNull();
            expect(state.user).toBeNull();
            expect(state.isInitialized).toBe(true);
        });

        it('세션이 있을 때 user와 session이 설정된다', async () => {
            // Arrange
            const mockUser = { id: 'user-123', email: 'test@example.com' };
            const mockSession = { user: mockUser, access_token: 'token-123' };
            mockGetSession.mockResolvedValue({ data: { session: mockSession } });
            mockOnAuthStateChange.mockImplementation(() => {});

            // Act
            await act(async () => {
                await useAuthStore.getState().initialize();
            });

            // Assert
            const state = useAuthStore.getState();
            expect(state.session).toEqual(mockSession);
            expect(state.user).toEqual(mockUser);
            expect(state.isInitialized).toBe(true);
        });

        it('onAuthStateChange 리스너가 등록된다', async () => {
            // Arrange
            mockGetSession.mockResolvedValue({ data: { session: null } });
            mockOnAuthStateChange.mockImplementation(() => {});

            // Act
            await act(async () => {
                await useAuthStore.getState().initialize();
            });

            // Assert
            expect(mockOnAuthStateChange).toHaveBeenCalled();
        });

        it('인증 상태 변경 시 스토어가 업데이트된다', async () => {
            // Arrange
            let authChangeCallback: any;
            mockGetSession.mockResolvedValue({ data: { session: null } });
            mockOnAuthStateChange.mockImplementation(callback => {
                authChangeCallback = callback;
            });

            await act(async () => {
                await useAuthStore.getState().initialize();
            });

            // Act - 인증 상태 변경 시뮬레이션
            const newUser = { id: 'new-user', email: 'new@example.com' };
            const newSession = { user: newUser, access_token: 'new-token' };

            act(() => {
                authChangeCallback('SIGNED_IN', newSession);
            });

            // Assert
            const state = useAuthStore.getState();
            expect(state.session).toEqual(newSession);
            expect(state.user).toEqual(newUser);
        });

        it('로그아웃 시 session과 user가 null이 된다', async () => {
            // Arrange
            let authChangeCallback: any;
            const mockUser = { id: 'user-123', email: 'test@example.com' };
            const mockSession = { user: mockUser, access_token: 'token-123' };
            mockGetSession.mockResolvedValue({ data: { session: mockSession } });
            mockOnAuthStateChange.mockImplementation(callback => {
                authChangeCallback = callback;
            });

            await act(async () => {
                await useAuthStore.getState().initialize();
            });

            // Act - 로그아웃 시뮬레이션
            act(() => {
                authChangeCallback('SIGNED_OUT', null);
            });

            // Assert
            const state = useAuthStore.getState();
            expect(state.session).toBeNull();
            expect(state.user).toBeNull();
        });
    });

    describe('signOut', () => {
        it('signOut 호출 시 supabase.auth.signOut이 호출된다', async () => {
            // Arrange
            mockSignOut.mockResolvedValue({ error: null });

            // Act
            await act(async () => {
                await useAuthStore.getState().signOut();
            });

            // Assert
            expect(mockSignOut).toHaveBeenCalled();
        });
    });

    describe('테스트 간 상태 격리', () => {
        it('첫 번째 테스트: 상태 변경', () => {
            // Act
            useAuthStore.setState({
                user: { id: 'test-user' } as any,
                isInitialized: true,
            });

            // Assert
            expect(useAuthStore.getState().user?.id).toBe('test-user');
        });

        it('두 번째 테스트: 상태가 초기화되어 있어야 함', () => {
            // Assert - beforeEach에서 초기화되었으므로 null이어야 함
            expect(useAuthStore.getState().user).toBeNull();
            expect(useAuthStore.getState().isInitialized).toBe(false);
        });
    });
});
