import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useModeSelection } from '../useModeSelection';

describe('useModeSelection', () => {
    it('초기 상태가 올바르게 설정된다', () => {
        // Arrange & Act
        const { result } = renderHook(() => useModeSelection());

        // Assert
        expect(result.current.modeSettings).toEqual({
            mode: 'simple',
        });
    });

    it('초기 상태는 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => useModeSelection());

        // Act & Assert
        expect(result.current.validate()).toBe(true);
    });

    it('setModeSettings로 simple 모드를 선택할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useModeSelection());

        // Act
        act(() => {
            result.current.setModeSettings({ mode: 'simple' });
        });

        // Assert
        expect(result.current.modeSettings.mode).toBe('simple');
        expect(result.current.validate()).toBe(true);
    });

    it('setModeSettings로 detail 모드를 선택할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useModeSelection());

        // Act
        act(() => {
            result.current.setModeSettings({ mode: 'detail' });
        });

        // Assert
        expect(result.current.modeSettings.mode).toBe('detail');
        expect(result.current.validate()).toBe(true);
    });

    it('simple과 detail 이외의 값은 허용되지 않는다', () => {
        // Arrange
        const { result } = renderHook(() => useModeSelection());

        // Act
        act(() => {
            // @ts-expect-error - 테스트를 위한 의도적인 타입 오류
            result.current.setModeSettings({ mode: 'invalid' });
        });

        // Assert
        expect(result.current.validate()).toBe(false);
    });
});
