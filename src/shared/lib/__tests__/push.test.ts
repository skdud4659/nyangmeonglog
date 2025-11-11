import { describe, it, expect } from 'vitest';
import { urlBase64ToUint8Array } from '../push';

describe('urlBase64ToUint8Array', () => {
    it('URL-safe Base64 문자열을 Uint8Array로 변환한다', () => {
        // Arrange: VAPID 키 형식의 URL-safe Base64 문자열
        // "ABC"를 Base64로 인코딩하면 "QUJD"
        const base64String = 'QUJD';

        // Act
        const result = urlBase64ToUint8Array(base64String);

        // Assert
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(3);
        expect(result[0]).toBe(65); // 'A'의 ASCII 코드
        expect(result[1]).toBe(66); // 'B'의 ASCII 코드
        expect(result[2]).toBe(67); // 'C'의 ASCII 코드
    });

    it('패딩이 필요한 경우 자동으로 추가한다', () => {
        // Base64는 4의 배수여야 하므로, 패딩(=)이 필요할 수 있음
        const base64String = 'QUI'; // 길이가 3이므로 패딩 1개 필요

        const result = urlBase64ToUint8Array(base64String);

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(2);
        expect(result[0]).toBe(65); // 'A'
        expect(result[1]).toBe(66); // 'B'
    });

    it('URL-safe 문자(-, _)를 표준 Base64(+, /)로 변환한다', () => {
        // URL-safe Base64에서는 +를 -, /를 _로 대체
        // "?>>"를 Base64로 인코딩하면 "Pz4+" -> URL-safe로는 "Pz4-"
        const urlSafeBase64 = 'Pz4-';

        const result = urlBase64ToUint8Array(urlSafeBase64);

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(3);
        expect(result[0]).toBe(63); // '?'
        expect(result[1]).toBe(62); // '>'
        expect(result[2]).toBe(62); // '>'
    });

    it('빈 문자열을 처리한다', () => {
        const result = urlBase64ToUint8Array('');

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(0);
    });

    it('긴 VAPID 키 형식의 문자열을 올바르게 변환한다', () => {
        // 실제 VAPID 키는 일반적으로 65바이트 (Base64로 인코딩하면 약 88자)
        const longBase64 = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib27SUrSk3K1IhHDB3_UPIQzCYU';

        const result = urlBase64ToUint8Array(longBase64);

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('각 문자의 charCode를 올바르게 추출한다', () => {
        // "Hello"를 Base64로 인코딩: "SGVsbG8"
        const base64String = 'SGVsbG8';

        const result = urlBase64ToUint8Array(base64String);

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result[0]).toBe(72); // 'H'
        expect(result[1]).toBe(101); // 'e'
        expect(result[2]).toBe(108); // 'l'
        expect(result[3]).toBe(108); // 'l'
        expect(result[4]).toBe(111); // 'o'
    });
});
