import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOwnerInfo } from '../useOwnerInfo';

describe('useOwnerInfo', () => {
    it('초기 상태가 올바르게 설정된다', () => {
        // Arrange & Act
        const { result } = renderHook(() => useOwnerInfo());

        // Assert
        expect(result.current.ownerInfo).toEqual({
            name: '',
            photo: '',
        });
    });

    it('setOwnerInfo로 이름을 변경할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({ name: '박멍이', photo: '' });
        });

        // Assert
        expect(result.current.ownerInfo.name).toBe('박멍이');
    });

    it('setOwnerInfo로 사진을 추가할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({
                name: '김냥이',
                photo: 'https://example.com/photo.jpg',
            });
        });

        // Assert
        expect(result.current.ownerInfo.photo).toBe('https://example.com/photo.jpg');
    });

    it('유효한 이름은 validate가 true를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({ name: '홍길동', photo: '' });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });

    it('빈 이름은 validate가 false를 반환한다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({ name: '', photo: '' });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(false);
    });

    it('사진이 없어도 이름만 있으면 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({ name: '테스트', photo: '' });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });

    it('공백만 있는 이름은 유효하지 않다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({ name: '   ', photo: '' });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(false);
    });

    it('이름과 사진을 동시에 변경할 수 있다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());
        const newData = {
            name: '새로운이름',
            photo: 'https://example.com/new.jpg',
        };

        // Act
        act(() => {
            result.current.setOwnerInfo(newData);
        });

        // Assert
        expect(result.current.ownerInfo).toEqual(newData);
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });

    it('한 글자 이름도 유효하다', () => {
        // Arrange
        const { result } = renderHook(() => useOwnerInfo());

        // Act
        act(() => {
            result.current.setOwnerInfo({ name: '김', photo: '' });
        });

        // Assert
        const isValid = result.current.validate();
        expect(isValid).toBe(true);
    });
});
