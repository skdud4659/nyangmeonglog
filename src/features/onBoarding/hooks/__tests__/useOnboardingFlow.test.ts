import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOnboardingFlow, TOTAL_STEPS } from '../useOnboardingFlow';
import type { PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';

describe('useOnboardingFlow', () => {
    it('초기 상태가 올바르게 설정된다', () => {
        // Arrange & Act
        const { result } = renderHook(() => useOnboardingFlow());

        // Assert
        expect(result.current.currentStep).toBe(0);
        expect(result.current.currentPetIndex).toBe(0);
        expect(result.current.totalPets).toBe(0); // 초기값: 0마리
    });

    it('TOTAL_STEPS는 5다', () => {
        // Assert
        expect(TOTAL_STEPS).toBe(5);
    });

    it('Step 0 (견주 정보)는 초기 상태에서 유효하지 않다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act & Assert
        expect(result.current.isStepValid()).toBe(false);
    });

    it('Step 0 (견주 정보)에 이름을 입력하면 유효해진다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });

        // Assert
        expect(result.current.isStepValid()).toBe(true);
    });

    it('Step 1 (펫 개수)에서 1마리 이상이면 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act - Step 1로 이동 후 펫 설정
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep();
        });
        act(() => {
            result.current.petCount.setPetCount({ dogs: 1, cats: 0 });
        });

        // Assert
        expect(result.current.currentStep).toBe(1);
        expect(result.current.isStepValid()).toBe(true);
    });

    it('nextStep으로 다음 단계로 이동할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(1);
    });

    it('현재 단계가 유효하지 않으면 nextStep이 동작하지 않는다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act - 이름을 입력하지 않은 상태에서 nextStep 시도
        act(() => {
            result.current.nextStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(0); // 그대로 0
    });

    it('prevStep으로 이전 단계로 이동할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act - Step 1로 이동 후 뒤로가기
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep();
        });
        expect(result.current.currentStep).toBe(1);

        act(() => {
            result.current.prevStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(0);
    });

    it('Step 0에서 prevStep을 호출하면 그대로 유지된다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act
        act(() => {
            result.current.prevStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(0);
    });

    it('펫 개수를 변경하면 totalPets가 업데이트된다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Act
        act(() => {
            result.current.petCount.setPetCount({ dogs: 2, cats: 1 });
        });

        // Assert
        expect(result.current.totalPets).toBe(3);
    });

    it('Step 2 (펫 상세 정보)에서 여러 펫을 순회할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Setup - Step 2까지 이동하고 펫 2마리 설정
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep(); // Step 1
        });
        act(() => {
            result.current.petCount.setPetCount({ dogs: 2, cats: 0 });
        });
        act(() => {
            result.current.nextStep(); // Step 2
        });

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
                name: '뽀삐',
                gender: 'female',
                breed: '푸들',
                weight: '7',
                isNeutered: false,
            },
        ];

        act(() => {
            result.current.petDetails.setPets(mockPets);
        });

        // Act - 첫 번째 펫에서 nextStep (두 번째 펫으로 이동)
        expect(result.current.currentPetIndex).toBe(0);
        act(() => {
            result.current.nextStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(2); // 여전히 Step 2
        expect(result.current.currentPetIndex).toBe(1); // 두 번째 펫
    });

    it('Step 2에서 마지막 펫의 nextStep은 Step 3으로 이동한다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Setup
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep(); // Step 1
        });
        act(() => {
            result.current.petCount.setPetCount({ dogs: 1, cats: 0 });
        });
        act(() => {
            result.current.nextStep(); // Step 2
        });

        const mockPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '시바견',
            weight: '10',
            isNeutered: true,
        };

        act(() => {
            result.current.petDetails.setPets([mockPet]);
        });

        // Act - 마지막 펫에서 nextStep
        act(() => {
            result.current.nextStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(3);
        expect(result.current.currentPetIndex).toBe(0); // 리셋됨
    });

    it('Step 2에서 prevStep으로 이전 펫으로 이동할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Setup
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep(); // Step 1
        });
        act(() => {
            result.current.petCount.setPetCount({ dogs: 2, cats: 0 });
        });
        act(() => {
            result.current.nextStep(); // Step 2
        });

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
                name: '뽀삐',
                gender: 'female',
                breed: '푸들',
                weight: '7',
                isNeutered: false,
            },
        ];

        act(() => {
            result.current.petDetails.setPets(mockPets);
        });

        act(() => {
            result.current.nextStep(); // 두 번째 펫으로
        });
        expect(result.current.currentPetIndex).toBe(1);

        // Act
        act(() => {
            result.current.prevStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(2); // 여전히 Step 2
        expect(result.current.currentPetIndex).toBe(0); // 첫 번째 펫
    });

    it('마지막 Step에서 nextStep을 호출하면 그대로 유지된다', () => {
        // Arrange
        const { result } = renderHook(() => useOnboardingFlow());

        // Setup - 모든 단계를 완료하고 Step 4까지 이동
        act(() => {
            result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
        });
        act(() => {
            result.current.nextStep(); // Step 1
        });
        act(() => {
            result.current.petCount.setPetCount({ dogs: 1, cats: 0 });
        });
        act(() => {
            result.current.nextStep(); // Step 2
        });

        const mockPet: PetInfoData = {
            id: '1',
            name: '멍멍이',
            gender: 'male',
            breed: '시바견',
            weight: '10',
            isNeutered: true,
        };

        act(() => {
            result.current.petDetails.setPets([mockPet]);
        });
        act(() => {
            result.current.nextStep(); // Step 3
        });
        act(() => {
            result.current.nextStep(); // Step 4
        });

        expect(result.current.currentStep).toBe(4);

        // Act
        act(() => {
            result.current.nextStep();
        });

        // Assert
        expect(result.current.currentStep).toBe(4); // 그대로 유지
    });
});
