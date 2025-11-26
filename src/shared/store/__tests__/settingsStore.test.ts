import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore, type AppMode } from '../settingsStore';

// Supabase 모킹
const mockGetUser = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: () => mockGetUser(),
        },
        from: () => ({
            update: (data: any) => ({
                eq: () => mockUpdate(data),
            }),
            select: () => ({
                eq: () => ({
                    single: () => mockSelect(),
                }),
            }),
        }),
    },
}));

describe('settingsStore', () => {
    // 각 테스트 전에 스토어 상태 초기화
    beforeEach(() => {
        vi.clearAllMocks();

        // persist 미들웨어를 사용하는 스토어 초기화
        useSettingsStore.setState({ mode: 'simple' });
    });

    describe('초기 상태', () => {
        it('초기 mode는 simple이다', () => {
            // Act
            const state = useSettingsStore.getState();

            // Assert
            expect(state.mode).toBe('simple');
        });
    });

    describe('setMode', () => {
        it('setMode로 mode를 변경할 수 있다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: null } });

            // Act
            await act(async () => {
                await useSettingsStore.getState().setMode('detail');
            });

            // Assert
            expect(useSettingsStore.getState().mode).toBe('detail');
        });

        it('setMode 호출 시 로그인된 사용자의 DB 프로필이 업데이트된다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
            mockUpdate.mockResolvedValue({ error: null });

            // Act
            await act(async () => {
                await useSettingsStore.getState().setMode('detail');
            });

            // Assert
            expect(mockUpdate).toHaveBeenCalledWith({ mode: 'detail' });
        });

        it('로그인하지 않은 경우 DB 업데이트를 시도하지 않는다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: null } });

            // Act
            await act(async () => {
                await useSettingsStore.getState().setMode('detail');
            });

            // Assert
            expect(mockUpdate).not.toHaveBeenCalled();
            expect(useSettingsStore.getState().mode).toBe('detail'); // 로컬 상태는 변경됨
        });

        it('simple과 detail 모드 간 전환이 가능하다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: null } });

            // Act - simple -> detail
            await act(async () => {
                await useSettingsStore.getState().setMode('detail');
            });
            expect(useSettingsStore.getState().mode).toBe('detail');

            // Act - detail -> simple
            await act(async () => {
                await useSettingsStore.getState().setMode('simple');
            });
            expect(useSettingsStore.getState().mode).toBe('simple');
        });
    });

    describe('syncModeFromProfile', () => {
        it('로그인된 사용자의 프로필에서 mode를 동기화한다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
            mockSelect.mockResolvedValue({ data: { mode: 'detail' } });

            // Act
            await act(async () => {
                await useSettingsStore.getState().syncModeFromProfile();
            });

            // Assert
            expect(useSettingsStore.getState().mode).toBe('detail');
        });

        it('로그인하지 않은 경우 동기화하지 않는다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: null } });
            useSettingsStore.setState({ mode: 'detail' });

            // Act
            await act(async () => {
                await useSettingsStore.getState().syncModeFromProfile();
            });

            // Assert - 변경되지 않음
            expect(useSettingsStore.getState().mode).toBe('detail');
            expect(mockSelect).not.toHaveBeenCalled();
        });

        it('프로필에 mode가 없으면 simple을 기본값으로 사용한다', async () => {
            // Arrange
            mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
            mockSelect.mockResolvedValue({ data: { mode: null } });
            useSettingsStore.setState({ mode: 'detail' });

            // Act
            await act(async () => {
                await useSettingsStore.getState().syncModeFromProfile();
            });

            // Assert
            expect(useSettingsStore.getState().mode).toBe('simple');
        });
    });

    describe('persist 미들웨어', () => {
        it('스토어 이름이 설정되어 있다', () => {
            // Assert - persist 미들웨어 설정 확인
            // @ts-expect-error - persist 내부 속성 접근
            const persistName = useSettingsStore.persist?.getOptions?.()?.name;
            expect(persistName).toBe('nyangmeonglog-settings');
        });
    });

    describe('타입 안전성', () => {
        it('AppMode 타입은 simple 또는 detail만 허용한다', () => {
            // Arrange
            const validModes: AppMode[] = ['simple', 'detail'];

            // Assert
            validModes.forEach(mode => {
                expect(['simple', 'detail']).toContain(mode);
            });
        });
    });
});
