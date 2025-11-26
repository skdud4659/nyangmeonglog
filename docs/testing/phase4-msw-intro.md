# 🌐 Phase 4: MSW 기초 (네트워크 레벨 모킹)

## 📊 테스트 결과 요약

- **테스트 파일**: 1개
- **테스트 케이스**: 12개 (모두 통과 ✅)
- **학습 목표**: MSW의 개념과 CRUD 패턴 이해

---

# 🤔 MSW란?

## Mock Service Worker

MSW는 **네트워크 레벨**에서 HTTP 요청을 가로채는 API 모킹 라이브러리입니다.

```
[애플리케이션] → fetch/axios → [MSW가 가로챔] → [모의 응답 반환]
                                    ↑
                               네트워크 레벨
```

---

# 🔄 vi.mock() vs MSW 비교

## 핵심 차이점

| 항목 | vi.mock() | MSW |
| --- | --- | --- |
| **모킹 레벨** | 모듈 (import) | 네트워크 (HTTP) |
| **동작 방식** | import를 대체 | fetch/axios 가로챔 |
| **API 함수 실행** | ❌ 실제로 실행 안 됨 | ✅ 실제로 실행됨 |
| **설정 위치** | 테스트 파일 상단 | 별도 핸들러 파일 |
| **적합한 용도** | 유닛 테스트 | 통합 테스트 |

## 동작 흐름 비교

```
vi.mock() - 모듈 레벨
──────────────────────────────────────
코드: import { getUserPets } from './api'
      ↓
      vi.mock()이 import 자체를 가짜로 대체
      ↓
      getUserPets()는 실제 함수가 아님 (fetch 실행 안 함)


MSW - 네트워크 레벨
──────────────────────────────────────
코드: import { getUserPets } from './api'
      ↓
      getUserPets()는 진짜 함수 (실제로 fetch 실행)
      ↓
      fetch('https://...') 호출됨
      ↓
      MSW가 네트워크에서 가로채서 가짜 응답 반환
```

> **중요**: MSW도 실제 서버를 찌르는 게 아닙니다! 네트워크 요청을 **가로채서** 가짜 응답을 반환하는 것입니다.

## 코드 비교

### vi.mock() 방식 (Phase 2, 3에서 사용)

```typescript
// 모듈 레벨 - import를 대체
vi.mock('@/features/main/home/api/petsApi', () => ({
    getUserPets: vi.fn().mockResolvedValue([{ id: 'pet-1' }]),
}));

// 테스트
it('펫 목록을 가져온다', async () => {
    const pets = await getUserPets('user-123');
    expect(pets).toHaveLength(1);
});
```

### MSW 방식 (Phase 4)

```typescript
// 네트워크 레벨 - HTTP 요청을 가로챔
http.get(`${SUPABASE_URL}/rest/v1/pets`, () => {
    return HttpResponse.json([{ id: 'pet-1' }]);
});

// 테스트 - 실제 fetch가 동작
it('펫 목록을 가져온다', async () => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pets`);
    const pets = await response.json();
    expect(pets).toHaveLength(1);
});
```

---

# 📁 MSW 프로젝트 구조

```
src/
├── mocks/
│   ├── handlers.ts      # MSW 핸들러 정의
│   ├── server.ts        # 테스트용 서버 설정
│   └── __tests__/
│       └── msw-crud.test.ts  # CRUD 테스트
├── setupTests.ts        # Vitest 전역 설정
```

---

# 🛠 MSW 설정 방법

## 1. 설치

```bash
npm install msw --save-dev
```

## 2. 핸들러 작성 (`handlers.ts`)

```typescript
import { http, HttpResponse } from 'msw';

// 인메모리 DB (테스트용)
export const db = {
    schedules: [] as any[],
};

export const resetDb = () => {
    db.schedules = [];
};

export const handlers = [
    // CREATE
    http.post(`${URL}/schedules`, async ({ request }) => {
        const body = await request.json();
        const newItem = { id: `id-${Date.now()}`, ...body };
        db.schedules.push(newItem);
        return HttpResponse.json(newItem, { status: 201 });
    }),

    // READ
    http.get(`${URL}/schedules`, () => {
        return HttpResponse.json(db.schedules);
    }),

    // UPDATE
    http.patch(`${URL}/schedules`, async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get('id')?.replace('eq.', '');
        const body = await request.json();
        // ... 업데이트 로직
    }),

    // DELETE
    http.delete(`${URL}/schedules`, ({ request }) => {
        // ... 삭제 로직
        return new HttpResponse(null, { status: 204 });
    }),
];
```

## 3. 서버 설정 (`server.ts`)

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## 4. Vitest 설정 (`setupTests.ts`)

```typescript
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
import { resetDb } from './mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
    server.resetHandlers();
    resetDb();
});
afterAll(() => server.close());
```

## 5. vitest.config.ts 수정

```typescript
export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/setupTests.ts'], // 추가
    },
});
```

---

# 📝 CRUD 테스트 패턴

## CREATE 테스트

```typescript
it('POST 요청으로 새 스케줄을 생성할 수 있다', async () => {
    // Arrange
    const newSchedule = {
        user_id: 'user-123',
        title: '병원 예약',
        date: '2025-01-15',
    };

    // Act
    const response = await fetch(`${URL}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.title).toBe('병원 예약');
});
```

## READ 테스트

```typescript
it('GET 요청으로 스케줄을 조회할 수 있다', async () => {
    // Arrange - 테스트 데이터 준비
    db.schedules = [
        { id: 'schedule-1', title: '병원 예약' },
        { id: 'schedule-2', title: '미용 예약' },
    ];

    // Act
    const response = await fetch(`${URL}/schedules`);
    const data = await response.json();

    // Assert
    expect(response.ok).toBe(true);
    expect(data).toHaveLength(2);
});
```

## UPDATE 테스트

```typescript
it('PATCH 요청으로 스케줄을 수정할 수 있다', async () => {
    // Arrange
    db.schedules = [{ id: 'schedule-1', title: '병원 예약', is_completed: false }];

    // Act
    const response = await fetch(`${URL}/schedules?id=eq.schedule-1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: true }),
    });
    const data = await response.json();

    // Assert
    expect(data.is_completed).toBe(true);
});
```

## DELETE 테스트

```typescript
it('DELETE 요청으로 스케줄을 삭제할 수 있다', async () => {
    // Arrange
    db.schedules = [{ id: 'schedule-1' }, { id: 'schedule-2' }];

    // Act
    const response = await fetch(`${URL}/schedules?id=eq.schedule-1`, {
        method: 'DELETE',
    });

    // Assert
    expect(response.status).toBe(204);
    expect(db.schedules).toHaveLength(1);
});
```

---

# 🎯 인메모리 DB 패턴

## 인메모리 DB란?

**메모리(RAM)에만 존재하는 임시 데이터 저장소**입니다. 쉽게 말해 **JavaScript 배열/객체**로 만든 가짜 데이터베이스예요.

```
일반 DB (Supabase 등)          vs     인메모리 DB
───────────────────────────────────────────────────
    디스크에 저장                     메모리에만 저장
    영구 보관                         프로그램 종료 시 사라짐
    느림 (I/O 필요)                   빠름 (메모리 직접 접근)
```

## 왜 인메모리 DB를 사용하나?

MSW 핸들러에서 **상태를 유지**하려면 인메모리 저장소가 필요합니다.

### 인메모리 DB가 없으면?

```typescript
// 항상 같은 응답 (상태 없음)
http.get('/schedules', () => {
    return HttpResponse.json([{ id: 'schedule-1' }]);
});
```

- ✅ GET 테스트 가능
- ❌ POST 후 GET하면 추가된 데이터 안 보임
- ❌ DELETE 후 GET하면 여전히 다 있음

### 인메모리 DB가 있으면?

```typescript
const db = { schedules: [] };

http.post('/schedules', async ({ request }) => {
    const data = await request.json();
    db.schedules.push(data);  // 저장
    return HttpResponse.json(data);
});

http.get('/schedules', () => {
    return HttpResponse.json(db.schedules);  // 저장된 거 반환
});
```

- ✅ POST → GET 하면 추가된 데이터 보임
- ✅ DELETE → GET 하면 삭제 반영됨
- ✅ **CRUD 흐름 테스트 가능**

### 언제 인메모리 DB가 필요한가?

| 테스트 목적 | 인메모리 DB |
|------------|------------|
| 단일 API 응답 확인 | 필요 없음 |
| CRUD 연속 흐름 테스트 | **필요** |
| 에러 응답 테스트 | 필요 없음 |

```typescript
// handlers.ts
export const db = {
    schedules: [] as any[],
};

// 테스트 간 격리를 위한 초기화 함수
export const resetDb = () => {
    db.schedules = [];
};
```

## 테스트에서 직접 DB 접근

```typescript
// 테스트 데이터 준비
beforeEach(() => {
    db.schedules = [
        { id: 'schedule-1', title: '테스트 스케줄' },
    ];
});

// DB 상태 직접 검증
it('삭제 후 DB에서 제거된다', async () => {
    await fetch(`${URL}/schedules?id=eq.schedule-1`, { method: 'DELETE' });

    expect(db.schedules).toHaveLength(0); // 인메모리 DB 직접 확인
});
```

---

# 🔑 핵심 API 정리

| API | 용도 | 예시 |
| --- | --- | --- |
| `http.get()` | GET 요청 핸들러 | `http.get('/api/users', handler)` |
| `http.post()` | POST 요청 핸들러 | `http.post('/api/users', handler)` |
| `http.patch()` | PATCH 요청 핸들러 | `http.patch('/api/users', handler)` |
| `http.delete()` | DELETE 요청 핸들러 | `http.delete('/api/users', handler)` |
| `HttpResponse.json()` | JSON 응답 생성 | `HttpResponse.json(data, { status: 200 })` |
| `setupServer()` | Node.js용 MSW 서버 | `setupServer(...handlers)` |
| `server.listen()` | 서버 시작 | `beforeAll(() => server.listen())` |
| `server.close()` | 서버 종료 | `afterAll(() => server.close())` |
| `server.resetHandlers()` | 핸들러 리셋 | `afterEach(() => server.resetHandlers())` |

---

# 🚀 스터디 발제 주제

## 1. vi.mock() vs MSW 선택 기준

**주제**: "언제 vi.mock()을 쓰고, 언제 MSW를 쓸까?"

**토론 질문**:
- 유닛 테스트와 통합 테스트의 경계는 어디일까?
- Supabase 같은 SDK를 테스트할 때 어떤 방식이 좋을까?

---

## 2. 테스트 데이터 관리

**주제**: "테스트 데이터는 어디에, 어떻게 관리할까?"

**토론 질문**:
- 인메모리 DB vs 실제 테스트 DB의 장단점은?
- fixture 파일로 관리하면 어떤 장점이 있을까?

---

## 3. MSW의 한계와 대안

**주제**: "MSW로 테스트할 수 없는 것들"

**핵심 내용**:
- WebSocket, GraphQL Subscription은 추가 설정 필요
- Supabase Realtime은 별도 모킹 필요
- 실제 네트워크 지연, 타임아웃 테스트는 제한적

**토론 질문**:
- E2E 테스트(Playwright/Cypress)와 MSW 테스트의 역할 분담은?

---

# 📚 다음 단계 (Phase 5 예정)

### Supabase + MSW 통합
- 실제 `schedulesApi.ts`를 MSW로 테스트
- Supabase 클라이언트 설정 모킹
- 인증 플로우 테스트

---

# ✅ 완료된 작업

1. ✅ MSW 설치 및 설정
2. ✅ handlers.ts 작성 (CRUD 핸들러)
3. ✅ server.ts 작성 (테스트 서버)
4. ✅ setupTests.ts 작성 (전역 설정)
5. ✅ CRUD 테스트 12개 작성 및 통과

---

# 📂 테스트 파일 구조

```
src/
├── mocks/
│   ├── handlers.ts           # CRUD 핸들러
│   ├── server.ts             # MSW 서버
│   └── __tests__/
│       └── msw-crud.test.ts  # 12 tests
├── setupTests.ts             # Vitest 전역 설정
```

---

# 📊 전체 테스트 현황

| Phase | 대상 | 파일 수 | 테스트 수 |
| --- | --- | --- | --- |
| Phase 1 | 유틸 함수 | 2 | 18 |
| Phase 2 | 커스텀 훅 | 7 | 69 |
| Phase 3 | 스토어 | 3 | 39 |
| Phase 4 | MSW CRUD | 1 | 12 |
| **합계** | - | **13** | **138** |

---

**작성일**: 2025-11-26
