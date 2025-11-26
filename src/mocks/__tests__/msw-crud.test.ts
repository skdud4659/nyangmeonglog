import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '../handlers';

/**
 * MSW CRUD 테스트
 *
 * 이 테스트는 MSW(Mock Service Worker)를 사용하여
 * 네트워크 레벨에서 API 요청을 가로채고 모킹하는 방법을 학습합니다.
 *
 * vi.mock()과의 차이:
 * - vi.mock(): 모듈 레벨 모킹 (import를 대체)
 * - MSW: 네트워크 레벨 모킹 (실제 fetch/axios 호출을 가로챔)
 */

const SUPABASE_URL = 'https://test.supabase.co';

describe('MSW CRUD 테스트', () => {
    beforeEach(() => {
        resetDb();
    });

    describe('CREATE - 스케줄 생성', () => {
        it('POST 요청으로 새 스케줄을 생성할 수 있다', async () => {
            // Arrange
            const newSchedule = {
                user_id: 'user-123',
                pet_id: 'pet-456',
                category: 'health',
                title: '병원 예약',
                date: '2025-01-15',
                is_completed: false,
            };

            // Act
            const response = await fetch(`${SUPABASE_URL}/rest/v1/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule),
            });
            const data = await response.json();

            // Assert
            expect(response.status).toBe(201);
            expect(data.id).toBeDefined();
            expect(data.title).toBe('병원 예약');
            expect(data.user_id).toBe('user-123');
        });

        it('생성된 스케줄이 DB에 저장된다', async () => {
            // Arrange
            const newSchedule = {
                user_id: 'user-123',
                title: '미용 예약',
                category: 'care',
                date: '2025-01-20',
            };

            // Act
            await fetch(`${SUPABASE_URL}/rest/v1/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule),
            });

            // Assert - 인메모리 DB 직접 확인
            expect(db.schedules).toHaveLength(1);
            expect(db.schedules[0].title).toBe('미용 예약');
        });
    });

    describe('READ - 스케줄 조회', () => {
        beforeEach(() => {
            // 테스트 데이터 준비
            db.schedules = [
                {
                    id: 'schedule-1',
                    user_id: 'user-123',
                    title: '병원 예약',
                    category: 'health',
                    date: '2025-01-15',
                    is_completed: false,
                },
                {
                    id: 'schedule-2',
                    user_id: 'user-123',
                    title: '미용 예약',
                    category: 'care',
                    date: '2025-01-20',
                    is_completed: true,
                },
                {
                    id: 'schedule-3',
                    user_id: 'user-456', // 다른 사용자
                    title: '산책',
                    category: 'care',
                    date: '2025-01-18',
                    is_completed: false,
                },
            ];
        });

        it('GET 요청으로 모든 스케줄을 조회할 수 있다', async () => {
            // Act
            const response = await fetch(`${SUPABASE_URL}/rest/v1/schedules`);
            const data = await response.json();

            // Assert
            expect(response.ok).toBe(true);
            expect(data).toHaveLength(3);
        });

        it('user_id로 필터링하여 조회할 수 있다', async () => {
            // Act - Supabase 스타일 쿼리 파라미터
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/schedules?user_id=eq.user-123`
            );
            const data = await response.json();

            // Assert
            expect(data).toHaveLength(2);
            expect(data.every((s: any) => s.user_id === 'user-123')).toBe(true);
        });
    });

    describe('UPDATE - 스케줄 수정', () => {
        beforeEach(() => {
            db.schedules = [
                {
                    id: 'schedule-1',
                    user_id: 'user-123',
                    title: '병원 예약',
                    category: 'health',
                    date: '2025-01-15',
                    is_completed: false,
                },
            ];
        });

        it('PATCH 요청으로 스케줄을 수정할 수 있다', async () => {
            // Arrange
            const updates = { title: '병원 정기검진', is_completed: true };

            // Act
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/schedules?id=eq.schedule-1`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                }
            );
            const data = await response.json();

            // Assert
            expect(response.ok).toBe(true);
            expect(data.title).toBe('병원 정기검진');
            expect(data.is_completed).toBe(true);
        });

        it('존재하지 않는 스케줄 수정 시 404를 반환한다', async () => {
            // Act
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/schedules?id=eq.non-existent`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: '새 제목' }),
                }
            );

            // Assert
            expect(response.status).toBe(404);
        });

        it('완료 상태만 토글할 수 있다', async () => {
            // Act - is_completed만 업데이트
            await fetch(`${SUPABASE_URL}/rest/v1/schedules?id=eq.schedule-1`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed: true }),
            });

            // Assert - DB 직접 확인
            expect(db.schedules[0].is_completed).toBe(true);
            expect(db.schedules[0].title).toBe('병원 예약'); // 다른 필드는 유지
        });
    });

    describe('DELETE - 스케줄 삭제', () => {
        beforeEach(() => {
            db.schedules = [
                { id: 'schedule-1', user_id: 'user-123', title: '삭제할 스케줄' },
                { id: 'schedule-2', user_id: 'user-123', title: '유지할 스케줄' },
            ];
        });

        it('DELETE 요청으로 스케줄을 삭제할 수 있다', async () => {
            // Act
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/schedules?id=eq.schedule-1`,
                { method: 'DELETE' }
            );

            // Assert
            expect(response.status).toBe(204);
            expect(db.schedules).toHaveLength(1);
            expect(db.schedules[0].id).toBe('schedule-2');
        });

        it('존재하지 않는 스케줄 삭제 시 404를 반환한다', async () => {
            // Act
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/schedules?id=eq.non-existent`,
                { method: 'DELETE' }
            );

            // Assert
            expect(response.status).toBe(404);
        });

        it('삭제 후 다른 스케줄은 영향받지 않는다', async () => {
            // Act
            await fetch(`${SUPABASE_URL}/rest/v1/schedules?id=eq.schedule-1`, {
                method: 'DELETE',
            });

            // Assert
            expect(db.schedules.find(s => s.id === 'schedule-2')).toBeDefined();
        });
    });

    describe('테스트 격리 확인', () => {
        it('첫 번째 테스트: 데이터 추가', async () => {
            // Act
            await fetch(`${SUPABASE_URL}/rest/v1/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: '테스트 스케줄' }),
            });

            // Assert
            expect(db.schedules).toHaveLength(1);
        });

        it('두 번째 테스트: DB가 초기화되어 있어야 함', () => {
            // Assert - beforeEach에서 resetDb() 호출로 초기화됨
            expect(db.schedules).toHaveLength(0);
        });
    });
});
