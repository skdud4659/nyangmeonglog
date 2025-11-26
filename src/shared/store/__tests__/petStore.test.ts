import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import { usePetStore, useActivePet } from '../petStore';
import { renderHook } from '@testing-library/react';

// API 모킹
const mockGetUserPets = vi.fn();
const mockGetActivePetId = vi.fn();
const mockSetActivePetId = vi.fn();

vi.mock('@/features/main/home/api/petsApi', () => ({
    getUserPets: (userId: string) => mockGetUserPets(userId),
}));

vi.mock('@/shared/api/profileApi', () => ({
    getActivePetId: () => mockGetActivePetId(),
    setActivePetId: (petId: string) => mockSetActivePetId(petId),
}));

describe('petStore', () => {
    const mockPets = [
        { id: 'pet-1', name: '멍멍이', species: 'dog' },
        { id: 'pet-2', name: '야옹이', species: 'cat' },
        { id: 'pet-3', name: '뽀삐', species: 'dog' },
    ];

    // 각 테스트 전에 스토어 상태 초기화
    beforeEach(() => {
        vi.clearAllMocks();

        // authStore 초기화
        useAuthStore.setState({
            session: null,
            user: null,
            isInitialized: false,
        });

        // petStore 초기화
        usePetStore.setState({
            pets: [],
            activePetId: null,
            isLoading: false,
        });
    });

    describe('초기 상태', () => {
        it('초기 상태가 올바르게 설정된다', () => {
            // Act
            const state = usePetStore.getState();

            // Assert
            expect(state.pets).toEqual([]);
            expect(state.activePetId).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });

    describe('loadPetsForCurrentUser', () => {
        it('로그인하지 않은 경우 펫을 로드하지 않는다', async () => {
            // Arrange - user가 없음
            useAuthStore.setState({ user: null });

            // Act
            await act(async () => {
                await usePetStore.getState().loadPetsForCurrentUser();
            });

            // Assert
            expect(mockGetUserPets).not.toHaveBeenCalled();
            expect(usePetStore.getState().pets).toEqual([]);
        });

        it('로그인된 경우 펫 목록을 로드한다', async () => {
            // Arrange
            useAuthStore.setState({ user: { id: 'user-123' } as any });
            mockGetUserPets.mockResolvedValue(mockPets);
            mockGetActivePetId.mockResolvedValue(null);
            mockSetActivePetId.mockResolvedValue(undefined);

            // Act
            await act(async () => {
                await usePetStore.getState().loadPetsForCurrentUser();
            });

            // Assert
            expect(mockGetUserPets).toHaveBeenCalledWith('user-123');
            expect(usePetStore.getState().pets).toEqual(mockPets);
        });

        it('로딩 중 isLoading이 true가 된다', async () => {
            // Arrange
            useAuthStore.setState({ user: { id: 'user-123' } as any });
            let resolveGetPets: any;
            mockGetUserPets.mockReturnValue(
                new Promise(resolve => {
                    resolveGetPets = resolve;
                })
            );
            mockGetActivePetId.mockResolvedValue(null);

            // Act - 로딩 시작
            const loadPromise = usePetStore.getState().loadPetsForCurrentUser();

            // Assert - 로딩 중
            expect(usePetStore.getState().isLoading).toBe(true);

            // Act - 로딩 완료
            await act(async () => {
                resolveGetPets(mockPets);
                await loadPromise;
            });

            // Assert - 로딩 완료
            expect(usePetStore.getState().isLoading).toBe(false);
        });

        describe('activePetId 우선순위', () => {
            it('현재 activePetId가 유효하면 유지한다', async () => {
                // Arrange
                useAuthStore.setState({ user: { id: 'user-123' } as any });
                usePetStore.setState({ activePetId: 'pet-2' });
                mockGetUserPets.mockResolvedValue(mockPets);
                mockGetActivePetId.mockResolvedValue('pet-1'); // DB에는 다른 값
                mockSetActivePetId.mockResolvedValue(undefined);

                // Act
                await act(async () => {
                    await usePetStore.getState().loadPetsForCurrentUser();
                });

                // Assert - 현재 값 유지
                expect(usePetStore.getState().activePetId).toBe('pet-2');
            });

            it('현재 activePetId가 없으면 DB 값을 사용한다', async () => {
                // Arrange
                useAuthStore.setState({ user: { id: 'user-123' } as any });
                usePetStore.setState({ activePetId: null });
                mockGetUserPets.mockResolvedValue(mockPets);
                mockGetActivePetId.mockResolvedValue('pet-2');
                mockSetActivePetId.mockResolvedValue(undefined);

                // Act
                await act(async () => {
                    await usePetStore.getState().loadPetsForCurrentUser();
                });

                // Assert - DB 값 사용
                expect(usePetStore.getState().activePetId).toBe('pet-2');
            });

            it('현재 값과 DB 값 모두 없으면 첫 번째 펫을 선택한다', async () => {
                // Arrange
                useAuthStore.setState({ user: { id: 'user-123' } as any });
                usePetStore.setState({ activePetId: null });
                mockGetUserPets.mockResolvedValue(mockPets);
                mockGetActivePetId.mockResolvedValue(null);
                mockSetActivePetId.mockResolvedValue(undefined);

                // Act
                await act(async () => {
                    await usePetStore.getState().loadPetsForCurrentUser();
                });

                // Assert - 첫 번째 펫
                expect(usePetStore.getState().activePetId).toBe('pet-1');
            });

            it('현재 activePetId가 유효하지 않으면 (목록에 없으면) DB 값을 사용한다', async () => {
                // Arrange
                useAuthStore.setState({ user: { id: 'user-123' } as any });
                usePetStore.setState({ activePetId: 'deleted-pet' }); // 삭제된 펫
                mockGetUserPets.mockResolvedValue(mockPets);
                mockGetActivePetId.mockResolvedValue('pet-2');
                mockSetActivePetId.mockResolvedValue(undefined);

                // Act
                await act(async () => {
                    await usePetStore.getState().loadPetsForCurrentUser();
                });

                // Assert - DB 값 사용
                expect(usePetStore.getState().activePetId).toBe('pet-2');
            });

            it('펫 목록이 비어있으면 activePetId는 null이다', async () => {
                // Arrange
                useAuthStore.setState({ user: { id: 'user-123' } as any });
                mockGetUserPets.mockResolvedValue([]);
                mockGetActivePetId.mockResolvedValue(null);
                mockSetActivePetId.mockResolvedValue(undefined);

                // Act
                await act(async () => {
                    await usePetStore.getState().loadPetsForCurrentUser();
                });

                // Assert
                expect(usePetStore.getState().activePetId).toBeNull();
            });
        });

        it('선택된 펫이 DB와 다르면 DB를 업데이트한다', async () => {
            // Arrange
            useAuthStore.setState({ user: { id: 'user-123' } as any });
            usePetStore.setState({ activePetId: null });
            mockGetUserPets.mockResolvedValue(mockPets);
            mockGetActivePetId.mockResolvedValue(null); // DB에 저장된 값 없음
            mockSetActivePetId.mockResolvedValue(undefined);

            // Act
            await act(async () => {
                await usePetStore.getState().loadPetsForCurrentUser();
            });

            // Assert - 첫 번째 펫으로 DB 업데이트
            expect(mockSetActivePetId).toHaveBeenCalledWith('pet-1');
        });
    });

    describe('setActivePetId', () => {
        it('activePetId를 변경할 수 있다', () => {
            // Arrange
            mockSetActivePetId.mockResolvedValue(undefined);

            // Act
            act(() => {
                usePetStore.getState().setActivePetId('pet-2');
            });

            // Assert
            expect(usePetStore.getState().activePetId).toBe('pet-2');
        });

        it('setActivePetId 호출 시 DB에도 저장된다', () => {
            // Arrange
            mockSetActivePetId.mockResolvedValue(undefined);

            // Act
            act(() => {
                usePetStore.getState().setActivePetId('pet-3');
            });

            // Assert
            expect(mockSetActivePetId).toHaveBeenCalledWith('pet-3');
        });
    });

    describe('updatePetInStore', () => {
        it('특정 펫의 정보를 업데이트할 수 있다', () => {
            // Arrange
            usePetStore.setState({ pets: mockPets as any });

            // Act
            act(() => {
                usePetStore.getState().updatePetInStore('pet-1', { name: '뭉치' });
            });

            // Assert
            const updatedPet = usePetStore.getState().pets.find(p => p.id === 'pet-1');
            expect(updatedPet?.name).toBe('뭉치');
        });

        it('다른 펫은 영향받지 않는다', () => {
            // Arrange
            usePetStore.setState({ pets: mockPets as any });

            // Act
            act(() => {
                usePetStore.getState().updatePetInStore('pet-1', { name: '뭉치' });
            });

            // Assert
            const otherPet = usePetStore.getState().pets.find(p => p.id === 'pet-2');
            expect(otherPet?.name).toBe('야옹이');
        });

        it('존재하지 않는 펫 ID로 업데이트해도 에러가 발생하지 않는다', () => {
            // Arrange
            usePetStore.setState({ pets: mockPets as any });

            // Act & Assert - 에러 없이 실행
            expect(() => {
                act(() => {
                    usePetStore.getState().updatePetInStore('non-existent', { name: '뭉치' });
                });
            }).not.toThrow();

            // 기존 펫들은 변경되지 않음
            expect(usePetStore.getState().pets).toHaveLength(3);
        });
    });

    describe('useActivePet 셀렉터', () => {
        it('활성 펫을 반환한다', () => {
            // Arrange
            usePetStore.setState({
                pets: mockPets as any,
                activePetId: 'pet-2',
            });

            // Act
            const { result } = renderHook(() => useActivePet());

            // Assert
            expect(result.current?.id).toBe('pet-2');
            expect(result.current?.name).toBe('야옹이');
        });

        it('activePetId가 없으면 undefined를 반환한다', () => {
            // Arrange
            usePetStore.setState({
                pets: mockPets as any,
                activePetId: null,
            });

            // Act
            const { result } = renderHook(() => useActivePet());

            // Assert
            expect(result.current).toBeUndefined();
        });

        it('activePetId에 해당하는 펫이 없으면 undefined를 반환한다', () => {
            // Arrange
            usePetStore.setState({
                pets: mockPets as any,
                activePetId: 'deleted-pet',
            });

            // Act
            const { result } = renderHook(() => useActivePet());

            // Assert
            expect(result.current).toBeUndefined();
        });
    });

    describe('스토어 간 의존성', () => {
        it('authStore의 user를 참조하여 동작한다', async () => {
            // Arrange - authStore에 user 설정
            useAuthStore.setState({ user: { id: 'user-456' } as any });
            mockGetUserPets.mockResolvedValue(mockPets);
            mockGetActivePetId.mockResolvedValue(null);
            mockSetActivePetId.mockResolvedValue(undefined);

            // Act
            await act(async () => {
                await usePetStore.getState().loadPetsForCurrentUser();
            });

            // Assert
            expect(mockGetUserPets).toHaveBeenCalledWith('user-456');
        });
    });

    describe('persist 미들웨어', () => {
        it('activePetId만 persist된다 (partialize)', () => {
            // Assert - persist 설정 확인
            const persistOptions = (usePetStore as any).persist?.getOptions?.();
            expect(persistOptions?.name).toBe('nyangmeonglog-pet');

            // partialize 함수 테스트
            const state = { pets: mockPets, activePetId: 'pet-1', isLoading: false };
            const partializedState = persistOptions?.partialize?.(state as any);
            expect(partializedState).toEqual({ activePetId: 'pet-1' });
        });
    });
});
