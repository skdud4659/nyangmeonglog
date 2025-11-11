import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePetCount } from '../usePetCount';

describe('usePetCount', () => {
    it('초기 상태가 올바르게 설정된다', () => {
        // Arrange & Act
        const { result } = renderHook(() => usePetCount());

        // Assert
        expect(result.current.petCount).toEqual({
            dogs: 0,
            cats: 0,
        });
    });

    it('setPetCount로 상태를 변경할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 2, cats: 1 });
        });

        // Assert
        expect(result.current.petCount).toEqual({
            dogs: 2,
            cats: 1,
        });
    });

    it('유효한 펫 개수는 validate가 true를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 1, cats: 2 });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });

    it('최소 1마리는 있어야 한다 (모두 0이면 실패)', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 0, cats: 0 });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(false);
    });

    it('최대 4마리까지만 허용된다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 3, cats: 2 }); // 총 5마리
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(false);
    });

    it('경계값: 정확히 4마리는 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 2, cats: 2 }); // 총 4마리
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });

    it('경계값: 1마리만 있어도 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 1, cats: 0 });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });

    it('개별 펫 타입이 최대 4마리를 초과할 수 없다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: 5, cats: 0 });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(false);
    });

    it('음수 값은 허용되지 않는다', () => {
        // Arrange
        const { result } = renderHook(() => usePetCount());

        // Act
        act(() => {
            result.current.setPetCount({ dogs: -1, cats: 1 });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(false);
    });
});
