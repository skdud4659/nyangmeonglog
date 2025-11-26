import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
import { resetDb } from './mocks/handlers';

// MSW 서버 시작/종료
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
    server.resetHandlers();
    resetDb(); // 테스트 간 DB 초기화
});
afterAll(() => server.close());
