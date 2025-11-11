import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { formatDateKorean, getDday } from '../date';

describe('formatDateKorean', () => {
    it('ISO 날짜를 한글 형식으로 변환한다', () => {
        // Arrange (준비): 테스트할 입력 데이터 준비
        const isoDate = '2025-08-04';

        // Act (실행): 테스트할 함수 실행
        const result = formatDateKorean(isoDate);

        // Assert (검증): 결과가 예상과 일치하는지 확인
        expect(result).toBe('8월 4일');
    });

    it('1월 1일을 올바르게 변환한다', () => {
        const result = formatDateKorean('2025-01-01');
        expect(result).toBe('1월 1일');
    });

    it('12월 31일을 올바르게 변환한다', () => {
        const result = formatDateKorean('2025-12-31');
        expect(result).toBe('12월 31일');
    });

    it('2월 29일(윤년)을 올바르게 변환한다', () => {
        const result = formatDateKorean('2024-02-29');
        expect(result).toBe('2월 29일');
    });

    it('한 자리 월과 한 자리 일을 올바르게 처리한다', () => {
        const result = formatDateKorean('2025-03-05');
        expect(result).toBe('3월 5일');
    });
});

describe('getDday', () => {
    beforeEach(() => {
        // 테스트 시작 전에 현재 시간을 2025-11-04로 고정
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-11-04'));
    });

    afterEach(() => {
        // 테스트 후 실제 시간으로 복원
        vi.useRealTimers();
    });

    it('당일이면 "D-Day"를 반환한다', () => {
        const result = getDday('2025-11-04');
        expect(result).toBe('D-Day');
    });

    it('미래 날짜는 "D-n" 형식으로 반환한다', () => {
        const result = getDday('2025-11-10');
        expect(result).toBe('D-6');
    });

    it('과거 날짜는 "D+n" 형식으로 반환한다', () => {
        const result = getDday('2025-10-30');
        expect(result).toBe('D+5');
    });

    it('1일 후는 "D-1"을 반환한다', () => {
        const result = getDday('2025-11-05');
        expect(result).toBe('D-1');
    });

    it('1일 전은 "D+1"을 반환한다', () => {
        const result = getDday('2025-11-03');
        expect(result).toBe('D+1');
    });

    it('30일 후를 올바르게 계산한다', () => {
        const result = getDday('2025-12-04');
        expect(result).toBe('D-30');
    });

    it('1년 후를 올바르게 계산한다', () => {
        const result = getDday('2026-11-04');
        expect(result).toBe('D-365');
    });
});
