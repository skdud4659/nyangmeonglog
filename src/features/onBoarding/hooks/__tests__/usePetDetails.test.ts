import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePetDetails } from '../usePetDetails';
import type { PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';

describe('usePetDetails', () => {
    it('초기 상태가 빈 배열이다', () => {
        // Arrange & Act
        const { result } = renderHook(() => usePetDetails());

        // Assert
        expect(result.current.pets).toEqual([]);
    });

    it('setPets로 펫 목록을 설정할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const mockPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '시바견',
            weight: '10',
            isNeutered: true,
        };

        // Act
        act(() => {
            result.current.setPets([mockPet]);
        });

        // Assert
        expect(result.current.pets).toHaveLength(1);
        expect(result.current.pets[0]).toEqual(mockPet);
    });

    it('updatePet으로 특정 인덱스의 펫 정보를 업데이트할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const mockPets: PetInfoData[] = [
            {
                id: '1',
                name: '멍멍이',
                gender: 'male',
                breed: '시바견',
                weight: '10',
                isNeutered: true,
            },
            {
                id: '2',
                name: '야옹이',
                gender: 'female',
                breed: '페르시안',
                weight: '5',
                isNeutered: false,
            },
        ];

        act(() => {
            result.current.setPets(mockPets);
        });

        // Act - 첫 번째 펫의 이름 변경
        act(() => {
            result.current.updatePet(0, { name: '뭉치' });
        });

        // Assert
        expect(result.current.pets[0].name).toBe('뭉치');
        expect(result.current.pets[1].name).toBe('야옹이'); // 다른 펫은 변경되지 않음
    });

    it('유효한 펫 정보는 validate가 true를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const validPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '시바견',
            weight: '10',
            isNeutered: true,
        };

        act(() => {
            result.current.setPets([validPet]);
        });

        // Act & Assert
        expect(result.current.validate(0)).toBe(true);
    });

    it('이름이 빈 문자열이면 validate가 false를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const invalidPet: PetInfoData = {
            id: '1',
            name: '',
            gender: 'male',
            breed: '시바견',
            weight: '10',
            isNeutered: true,
        };

        act(() => {
            result.current.setPets([invalidPet]);
        });

        // Act & Assert
        expect(result.current.validate(0)).toBe(false);
    });

    it('품종이 빈 문자열이면 validate가 false를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const invalidPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '',
            weight: '10',
            isNeutered: true,
        };

        act(() => {
            result.current.setPets([invalidPet]);
        });

        // Act & Assert
        expect(result.current.validate(0)).toBe(false);
    });

    it('몸무게가 빈 문자열이면 validate가 false를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const invalidPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '시바견',
            weight: '',
            isNeutered: true,
        };

        act(() => {
            result.current.setPets([invalidPet]);
        });

        // Act & Assert
        expect(result.current.validate(0)).toBe(false);
    });

    it('선택 사항 필드(birthDate, adoptionDate, photo)는 없어도 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const validPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '시바견',
            weight: '10',
            isNeutered: null,
            // birthDate, adoptionDate, photo 없음
        };

        act(() => {
            result.current.setPets([validPet]);
        });

        // Act & Assert
        expect(result.current.validate(0)).toBe(true);
    });

    it('여러 펫을 관리할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => usePetDetails());
        const mockPets: PetInfoData[] = [
            {
                id: '1',
                name: '멍멍이',
                gender: 'male',
                breed: '시바견',
                weight: '10',
                isNeutered: true,
            },
            {
                id: '2',
                name: '야옹이',
                gender: 'female',
                breed: '페르시안',
                weight: '5',
                isNeutered: false,
            },
            {
                id: '3',
                name: '뽀삐',
                gender: 'male',
                breed: '푸들',
                weight: '7',
                isNeutered: true,
            },
        ];

        // Act
        act(() => {
            result.current.setPets(mockPets);
        });

        // Assert
        expect(result.current.pets).toHaveLength(3);
        expect(result.current.validate(0)).toBe(true);
        expect(result.current.validate(1)).toBe(true);
        expect(result.current.validate(2)).toBe(true);
    });
});
