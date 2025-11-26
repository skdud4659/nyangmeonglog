import { http, HttpResponse } from 'msw';

// Supabase URL (테스트용)
const SUPABASE_URL = 'https://test.supabase.co';

// 테스트용 인메모리 데이터베이스
export const db = {
    schedules: [] as any[],
};

// DB 초기화 헬퍼
export const resetDb = () => {
    db.schedules = [];
};

// 핸들러 정의
export const handlers = [
    // CREATE - 스케줄 생성
    http.post(`${SUPABASE_URL}/rest/v1/schedules`, async ({ request }) => {
        const body = (await request.json()) as any;
        const newSchedule = {
            id: `schedule-${Date.now()}`,
            ...body,
            created_at: new Date().toISOString(),
        };
        db.schedules.push(newSchedule);

        return HttpResponse.json(newSchedule, {
            status: 201,
            headers: { 'Content-Profile': 'public' },
        });
    }),

    // READ - 스케줄 목록 조회
    http.get(`${SUPABASE_URL}/rest/v1/schedules`, ({ request }) => {
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');

        let result = db.schedules;

        // user_id 필터
        if (userId) {
            const cleanUserId = userId.replace('eq.', '');
            result = result.filter(s => s.user_id === cleanUserId);
        }

        return HttpResponse.json(result, {
            headers: { 'Content-Profile': 'public' },
        });
    }),

    // UPDATE - 스케줄 수정 (PATCH)
    http.patch(`${SUPABASE_URL}/rest/v1/schedules`, async ({ request }) => {
        const url = new URL(request.url);
        const idParam = url.searchParams.get('id');
        const id = idParam?.replace('eq.', '');

        if (!id) {
            return HttpResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const body = (await request.json()) as any;
        const index = db.schedules.findIndex(s => s.id === id);

        if (index === -1) {
            return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }

        db.schedules[index] = { ...db.schedules[index], ...body };

        return HttpResponse.json(db.schedules[index], {
            headers: { 'Content-Profile': 'public' },
        });
    }),

    // DELETE - 스케줄 삭제
    http.delete(`${SUPABASE_URL}/rest/v1/schedules`, ({ request }) => {
        const url = new URL(request.url);
        const idParam = url.searchParams.get('id');
        const id = idParam?.replace('eq.', '');

        if (!id) {
            return HttpResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const index = db.schedules.findIndex(s => s.id === id);

        if (index === -1) {
            return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }

        db.schedules.splice(index, 1);

        return new HttpResponse(null, { status: 204 });
    }),
];
