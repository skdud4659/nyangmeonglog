# 🎓 Phase 5: 통합 테스트 (컴포넌트 + 훅 + 스토어)

## 📊 테스트 결과 요약

- **총 테스트 파일**: 3개
- **총 테스트 케이스**: 8개 (모두 통과 ✅)
- **테스트 대상 컴포넌트/페이지**:
    - `LoginPage` (+ `useLoginForm` 훅)
    - `OnboardingPage` (+ 온보딩 훅 조합)
    - `SchedulePage` (+ 일정 모달 및 스케줄 API 모킹)

이번 Phase의 통합 테스트들은 모두 **"사용자 시나리오"**를 기준으로 작성했습니다.

- 사용자가 실제로 하는 행동(입력 → 클릭 → 화면 변화)을 그대로 코드로 옮기고,
- 훅/스토어의 내부 구현보다는 **화면에 보이는 텍스트·버튼·상태 변화**를 중심으로 검증하는 것이 목표입니다.

---

# 📁 테스트 1: 로그인 페이지 통합 테스트 (LoginPage)

## 🎯 테스트 대상

- `src/features/auth/pages/LoginPage.tsx`
- 내부에서 사용하는 훅: `useLoginForm` (`src/features/auth/hooks/useLoginForm.ts`)

**주요 역할**

- 이메일/비밀번호 입력 폼 렌더링
- Zod 스키마 기반 폼 검증 (`loginSchema`)
- Supabase 로그인 API 호출 (`supabase.auth.signInWithPassword`)
- 성공 시 메인 홈으로 네비게이션 (`ROUTE_PATH.MAIN.HOME`)

## 핵심 테스트 케이스

### 1️⃣ 기본 렌더링 및 UI 구조 확인

```typescript
it('이메일/비밀번호 입력 필드와 로그인 버튼을 렌더링한다', () => {
    render(<LoginPage />);

    expect(screen.getByText('이메일')).toBeInTheDocument();
    expect(screen.getByText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
});
```

**학습 포인트**

- `getByRole('button', { name: '로그인' })`으로 버튼을 **사용자 시점**에서 찾기
- 단순 스냅샷 대신, 실제 화면에 보여지는 텍스트/버튼 존재 여부를 검증

---

### 2️⃣ 사용자 입력 → 버튼 활성화 (폼 상태 + 훅 결합)

```typescript
it('사용자가 이메일과 비밀번호를 입력하면 로그인 버튼이 활성화된다', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('이메일을 입력하세요');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: '로그인' });

    expect(loginButton).toBeDisabled();

    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'password123');

    expect(loginButton).toBeEnabled();
});
```

**학습 포인트**

- `userEvent.type`으로 실제 타이핑을 시뮬레이션
- `useLoginForm` 훅의 `isFormValid` 계산이 **컴포넌트의 disabled 상태와 제대로 연결**되는지 검증
- 구현 세부사항(상태 내부 구조)이 아니라, **"사용자가 봤을 때 버튼이 활성화되는가?"**를 테스트

---

### 3️⃣ 잘못된 이메일 형식 → Zod 에러 메시지 표시

```typescript
it('올바르지 않은 이메일 형식으로 제출하면 에러 메시지를 표시하고 API를 호출하지 않는다', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('이메일을 입력하세요');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: '로그인' });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(
        await screen.findByText(/올바른 이메일 형식이 아닙니다/i),
    ).toBeInTheDocument();

    expect(signInWithPasswordMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
});
```

**학습 포인트**

- **검증 실패 시에는 API를 호출하지 않는 것**까지 함께 검증
- `findByText` + `await`로 비동기 에러 메시지 렌더링을 기다림
- **"유효성 검사 → API 호출" 순서를 가진 폼**에서 두 단계를 분리해 테스트

---

### 4️⃣ 로그인 성공 → 메인 홈으로 네비게이션

```typescript
signInWithPasswordMock.mockResolvedValue({
    data: {
        session: { user: { id: 'user-123', email: 'user@test.com' } },
        user: { id: 'user-123', email: 'user@test.com' },
    },
    error: null,
});

render(<LoginPage />);

// ... 이메일/비밀번호 입력 후 버튼 클릭 ...

await waitFor(() => {
    expect(signInWithPasswordMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith({ to: ROUTE_PATH.MAIN.HOME });
});
```

**학습 포인트**

- `vi.mock('@/shared/lib/supabase')`로 Supabase 클라이언트를 **모듈 레벨에서 모킹**
- `vi.mock('@tanstack/react-router')`로 `useNavigate`를 모킹해 **라우팅 부작용을 관찰**
- 통합 테스트지만,
    - 폼 상태 (`useLoginForm`)
    - Zod 검증
    - 외부 의존성(Supabase, Router)
    - UI 상태 (버튼 enabled/disabled, 에러 메시지)
      를 **한 번에** 검증

---

# 📁 테스트 2: 온보딩 플로우 단계 전환 (OnboardingPage)

## 🎯 테스트 대상

- `src/features/onBoarding/pages/OnboardingPage.tsx`
- 내부 훅 조합:
    - `useOwnerInfo`
    - `usePetCount`
    - `usePetDetails`
    - `useModeSelection`

**주요 역할**

- 총 5단계 온보딩 플로우 관리
- 각 Step의 검증 결과에 따라 `다음페이지` 버튼 활성화
- 마지막 단계에서 메인 홈으로 이동

이번 Phase에서는 **초기 단계(집사 정보 입력 → 펫 개수 선택)**에 집중해,  
복수 단계 전환과 검증이 잘 묶여 있는지를 사용자 관점에서 테스트했다.

## 핵심 테스트 케이스

### 1️⃣ 초기 상태: 집사 정보 입력 단계 + 비활성화된 버튼

```typescript
it('초기에는 집사 정보 입력 단계가 보이고 다음 버튼은 비활성화된다', () => {
    render(<OnboardingPage />);

    expect(
        screen.getByText(/집사님의\s+정보를 입력해주세요!/),
    ).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: '다음페이지' });
    expect(nextButton).toBeDisabled();
});
```

**학습 포인트**

- 온보딩 첫 화면이 **의도한 Step (집사 정보)**인지 확인
- `useOwnerInfo` 훅의 초기 상태에서 `validateOwner()`가 false → 버튼 disabled로 연결되는 흐름 검증

---

### 2️⃣ 이름 입력 → 버튼 활성화 → 다음 Step 전환

```typescript
it('이름을 입력하면 다음 버튼이 활성화되고, 클릭 시 펫 개수 단계로 이동한다', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    const nameInput = screen.getByPlaceholderText('이름을 입력해주세요');
    const nextButton = screen.getByRole('button', { name: '다음페이지' });

    await user.type(nameInput, '김집사');
    expect(nextButton).toBeEnabled();

    await user.click(nextButton);

    expect(
        await screen.findByText(/어떤 반려동물을\s+몇마리 키우시나요\?/),
    ).toBeInTheDocument();
});
```

**학습 포인트**

- **단계 전환(현재 Step 상태)**을 "사용자가 보는 타이틀 텍스트"로 검증
- 훅 단위가 아니라, `OnboardingPage`가 여러 훅을 **조합해서 사용하는 방식**을 통합 관점에서 확인
- "폼 유효 → 버튼 활성화 → 클릭 → 다음 Step 화면" 이라는 **사용자 플로우 전체를 하나의 테스트로** 표현

---

# 📁 테스트 3: 일정 페이지 + 모달 통합 테스트 (SchedulePage)

## 🎯 테스트 대상

- `src/features/main/schedule/pages/SchedulePage.tsx`
- 내부 의존성:
    - 스토어: `useAuthStore`, `usePetStore`
    - API 모듈: `schedulesApi` (`listSchedules`, `createSchedule`, ...)
    - 모달 컴포넌트: `AddScheduleModal`

**주요 역할**

- 현재 사용자/펫/카테고리에 맞는 일정 목록 조회
- 모달을 통한 새 일정 등록
- 등록 후 **화면에 바로 반영**

이번 테스트에서는 **스토어 + API + 컴포넌트**가 엮인 흐름을 모듈 모킹으로 통합 검증했다.

## 모킹 전략

```typescript
// 스케줄 API 모듈 모킹
vi.mock('@/features/main/schedule/api/schedulesApi', () => ({
    listSchedules: (...args: unknown[]) => listSchedulesMock(...args),
    createSchedule: (...args: unknown[]) => createScheduleMock(...args),
    // 기타 함수들...
}));

// 인증 스토어 모킹
vi.mock('@/shared/store/authStore', () => ({
    useAuthStore: (selector: (state: { user: { id: string; email: string } | null }) => unknown) =>
        selector({ user: { id: 'user-123', email: 'user@test.com' } }),
}));

// 펫 스토어 모킹
vi.mock('@/shared/store/petStore', () => ({
    usePetStore: () => ({
        pets: mockPets,
        activePetId: 'pet-1',
    }),
}));
```

**학습 포인트**

- Zustand 스토어를 테스트에서 **간단한 함수형 훅으로 대체**하는 패턴
    - 실제 상태 관리 로직은 Phase 3에서 이미 검증됨
    - 여기서는 "페이지가 스토어 값을 어떻게 사용하는지"에 집중
- 스토어를 직접 모킹해도, React 입장에서는 그냥 **custom hook**으로 동작

### 로그인 이후 시나리오에서 상태 세팅 패턴

로그인 이후 화면(예: 일정 페이지)은 **매번 로그인 플로우를 다시 밟지 않고**,  
테스트 시작 전에 “이미 로그인된 상태”를 **스토어 모킹으로 미리 만들어 둔 뒤** 시나리오를 실행합니다.

- 인증/펫 스토어를 로그인 완료 상태로 세팅:

    ```typescript
    vi.mock('@/shared/store/authStore', () => ({
        useAuthStore: (selector: (state: any) => any) =>
            selector({
                user: { id: 'user-123', email: 'user@test.com' },
                session: {},
                isInitialized: true,
            }),
    }));

    vi.mock('@/shared/store/petStore', () => ({
        usePetStore: () => ({
            pets: [{ id: 'pet-1', name: '멍멍이', species: 'dog', photoUrl: null }],
            activePetId: 'pet-1',
            loadPetsForCurrentUser: vi.fn(),
        }),
    }));
    ```

- 이렇게 세팅한 뒤 `render(<SchedulePage />)`를 호출하면,  
  테스트는 곧바로 **“로그인 완료 + 펫 로드 완료” 상태에서 사용자 플로우**를 검증할 수 있습니다.

---

### 1️⃣ 초기 렌더링 시 일정 목록 조회

```typescript
it('초기 렌더링 시 현재 사용자와 카테고리로 일정을 조회한다', async () => {
    render(<SchedulePage />);

    await waitFor(() => {
        expect(listSchedulesMock).toHaveBeenCalledWith({
            userId: 'user-123',
            category: 'health',
        });
    });
});
```

**학습 포인트**

- `useEffect` 안에서 실행되는 비동기 로직을 `waitFor`로 검증
- 초기 카테고리 상태(`health`)와 스토어에서 가져온 `user.id`가  
  API 파라미터로 정확히 전달되는지 확인

---

### 2️⃣ 모달을 통한 새 일정 등록 플로우

```typescript
it('추가하기 버튼을 눌러 모달을 연 뒤 일정을 등록하면 화면에 새 일정이 표시된다', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    const addButton = await screen.findByRole('button', { name: '추가하기' });
    await user.click(addButton);

    const titleInput = await screen.findByPlaceholderText('예) 2차 종합백신 접종');
    const locationInput = screen.getByPlaceholderText('예) ○○○동물병원');

    await user.clear(titleInput);
    await user.type(titleInput, '병원 예약');
    await user.type(locationInput, '우리동물병원');

    const submitButton = screen.getByRole('button', { name: '등록' });
    await user.click(submitButton);

    await waitFor(() => {
        expect(createScheduleMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('병원 예약')).toBeInTheDocument();
});
```

**학습 포인트**

- **실제 사용자 플로우 그대로** 테스트:
    1. "추가하기" 버튼 클릭 → 모달 열림
    2. 제목/장소 입력
    3. "등록" 버튼 클릭 → API 호출
    4. 응답으로 받은 일정이 화면 목록에 추가
- `AddScheduleModal`을 단독으로 테스트하지 않고,  
  **페이지와 API 모듈까지 묶어서** 동작을 검증
- 여기서는 MSW 대신 `vi.mock()`으로 API 레이어를 대체  
  → 더 상위 레이어(페이지 + 스토어 + 모달) 동작에 집중

> 네트워크 레벨 CRUD 자체는 Phase 4에서 **MSW + 인메모리 DB**로 이미 학습했기 때문에,  
> Phase 5에서는 그 위 레이어인 **페이지/컴포넌트 + 훅 + 스토어 + 라우팅**에 집중하기 위해  
> `vi.mock`으로 모듈 단위만 가볍게 모킹하는 전략을 사용했다.

---

# 🎓 Testing Library 패턴 정리

## 1. 쿼리 우선순위

| 우선순위 | 쿼리                   | 예시                                          | 설명                                |
| -------- | ---------------------- | --------------------------------------------- | ----------------------------------- |
| 1        | `getByRole`            | `getByRole('button', { name: '로그인' })`     | 역할/이름 기반 (가장 사용자 친화적) |
| 2        | `getByLabelText`       | `getByLabelText('알림 사용')`                 | `<label>`과 연결된 폼 요소          |
| 3        | `getByPlaceholderText` | `getByPlaceholderText('이메일을 입력하세요')` | placeholder 기반 (보조용)           |
| 4        | `getByText`            | `getByText('병원 예약')`                      | 일반 텍스트 검색                    |

> 이번 프로젝트에서는 일부 인풋이 label과 프로그램적으로 연결되어 있지 않아  
> `getByLabelText`를 충분히 활용하지는 못했지만,  
> **버튼/링크는 항상 `getByRole`을 우선 사용**하는 패턴을 익혔다.

---

## 2. get / find / query 차이

| 함수       | 용도           | 성공 시               | 실패 시                |
| ---------- | -------------- | --------------------- | ---------------------- |
| `getBy*`   | 동기 쿼리      | 요소 반환             | **즉시** 에러 throw    |
| `findBy*`  | 비동기 쿼리    | `Promise`로 요소 반환 | 타임아웃 후 에러 throw |
| `queryBy*` | 존재 여부 체크 | 요소 또는 `null`      | 에러 대신 `null`       |

**실전 사용 예**

- **비동기 에러 메시지/데이터**: `findByText`, `findByRole`
- **존재하지 않아야 하는 요소**: `expect(queryByText('에러')).not.toBeInTheDocument()`
- **즉시 있어야 하는 버튼/레이블**: `getByRole`, `getByText`

---

## 3. userEvent로 사용자 행동 시뮬레이션

```typescript
const user = userEvent.setup();

await user.type(emailInput, 'user@test.com'); // 타이핑
await user.click(loginButton); // 클릭
await user.clear(titleInput); // 입력값 삭제
```

**학습 포인트**

- `fireEvent`보다 `userEvent`가 실제 사용자 행동과 더 가깝다
- 입력 → 검증 → 클릭 순서를 그대로 코드로 표현해 **테스트가 "시나리오"처럼 읽히게 만들기**

---

## 통합 테스트 vs E2E 테스트

이번 Phase 5에서 작성한 테스트는 모두 **통합 테스트**에 해당합니다.

- **통합 테스트 (지금 우리가 한 것)**:
    - 범위: 컴포넌트 + 훅 + 스토어 + (모킹된) API 모듈 + 라우팅
    - 환경: Vitest + Testing Library + happy-dom (브라우저를 흉내낸 가짜 DOM)
    - 목적: 우리 애플리케이션 코드 레이어들이 **서로 올바르게 연결되어 있는지** 빠르게 검증
    - 예: `LoginPage`에서 입력 → 훅 검증 → Supabase 모듈 호출 → `useNavigate` 콜백까지 한 번에 확인

- **E2E 테스트 (end-to-end)**:
    - 범위: 브라우저 ↔ 프론트엔드 ↔ 백엔드 ↔ DB까지 **전체 시스템**
    - 환경: Playwright / Cypress 같은 도구 + 실제(또는 테스트용) 서버
    - 목적: **배포된 앱이 실제 유저 입장에서 잘 동작하는지** 검증
    - 예: `/auth/signup` → 실제 회원가입 → 온보딩 → 메인 진입까지 실제 HTTP 요청을 포함한 전체 플로우

실무에서는 보통:

- 대부분의 로직/플로우는 **통합 테스트(빠르고 디버그 쉬움)** 로 커버하고,
- 정말 핵심이 되는 몇 개의 경로만 **E2E 테스트(느리지만 신뢰도 높음)** 로 보강하는 전략을 많이 사용합니다.

이번 Phase 5는 **“E2E까지 가기 직전 단계”**로,  
유저 시나리오를 Testing Library 수준에서 충분히 연습한 상태라고 보면 됩니다.

---

# 🔧 트러블슈팅: 통합 테스트 작성 시 마주친 이슈들

## 1. `toBeInTheDocument` 등 jest-dom matchers가 동작하지 않는 경우

**증상**: `Invalid Chai property: toBeInTheDocument` 에러 발생

**원인**: `@testing-library/jest-dom`이 설치되지 않았거나, setup 파일에서 import하지 않음

**해결**:

```bash
npm install --save-dev @testing-library/jest-dom
```

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
```

---

## 2. form submit 후 상태가 업데이트되지 않는 경우 (happy-dom)

**증상**: `userEvent.click(submitButton)` 후에도 에러 메시지가 나타나지 않음

**원인**: happy-dom 환경에서 버튼 클릭이 form submit을 제대로 트리거하지 않는 경우가 있음

**해결**: `fireEvent.submit(form)`을 사용

```typescript
import { fireEvent, act } from '@testing-library/react';

// 버튼 클릭 대신 form submit 직접 트리거
const form = screen.getByRole('button', { name: '로그인' }).closest('form')!;
await act(async () => {
    fireEvent.submit(form);
});
```

---

## 3. Supabase 환경 변수 에러로 테스트가 실패하는 경우

**증상**: `Error: supabaseUrl is required.`

**원인**: 컴포넌트가 import하는 모듈 체인에서 supabase 클라이언트가 초기화됨

**해결**: 해당 API 모듈을 테스트 파일 상단에서 mock

```typescript
vi.mock('@/features/onBoarding/api/onboardingApi', () => ({
    insertPet: vi.fn().mockResolvedValue({}),
    finalizeOnboarding: vi.fn().mockResolvedValue({}),
}));
```

---

## 4. 텍스트가 `<br>` 등으로 분리되어 있어 검색이 안 되는 경우

**증상**: `/어떤 반려동물을\s+몇마리 키우시나요\?/` 정규식이 매칭되지 않음

**원인**: 실제 DOM에서 텍스트가 여러 요소로 분리되어 있음

```tsx
<h1>
    어떤 반려동물을
    <br />
    몇마리 키우시나요?
</h1>
```

**해결**: 더 짧은 고유 텍스트로 검색

```typescript
// Before
expect(await screen.findByText(/어떤 반려동물을\s+몇마리 키우시나요\?/)).toBeInTheDocument();

// After
expect(await screen.findByText(/몇마리 키우시나요/)).toBeInTheDocument();
```

---

## 5. E2E 테스트가 Vitest에서 실행되는 경우

**증상**: Playwright E2E 테스트 파일이 `npm test`(Vitest)로 실행됨

**해결**: `vitest.config.ts`에서 e2e 폴더 제외

```typescript
export default defineConfig({
    test: {
        exclude: ['**/node_modules/**', '**/e2e/**'],
    },
});
```

---

# 🚀 스터디 발제 주제 제안 (Phase 5)

## 1. "사용자처럼 테스트하라"를 우리 코드에 적용해보기

**질문 예시**

- 지금 컴포넌트 테스트에서 **구현 디테일에 너무 의존하는 테스트**는 없는가?
- `getByTestId`를 쓰고 있다면, **`getByRole`/`getByText`로 바꿀 수 있는지** 점검해보기

---

## 2. 훅 테스트 vs 컴포넌트 통합 테스트의 경계

**토론 포인트**

- `useLoginForm`를 이미 훅 단위로 철저하게 테스트했는데,  
  왜 `LoginPage`를 별도로 통합 테스트해야 할까?
- 훅 테스트에서는 놓치기 쉬운 **UX 레벨의 버그**(disabled 상태, 버튼 라벨, 에러 메시지 위치 등)는 무엇이 있을까?

---

## 3. 스토어를 모킹할 때와 실제 스토어를 사용할 때

**질문 예시**

- 이번 SchedulePage 테스트처럼 스토어를 모킹하면 좋은 상황은?
- 반대로, **실제 Zustand 스토어를 그대로 쓰는 통합 테스트**가 필요해지는 타이밍은 언제일까?

---

# 📂 테스트 파일 구조 (Phase 5 추가분)

```text
src/
├── features/
│   ├── auth/
│   │   └── pages/
│   │       └── __tests__/
│   │           └── LoginPage.test.tsx          # LoginPage + useLoginForm 통합 테스트 (4 tests)
│   ├── onBoarding/
│   │   └── pages/
│   │       └── __tests__/
│   │           └── OnboardingPage.test.tsx     # 온보딩 초기 단계 전환 테스트 (2 tests)
│   └── main/
│       └── schedule/
│           └── pages/
│               └── __tests__/
│                   └── SchedulePage.test.tsx   # 일정 페이지 + 모달 통합 테스트 (2 tests)
```

---

# 📊 전체 테스트 현황 (업데이트)

| Phase       | 대상                          | 파일 수 | 테스트 수 |
| ----------- | ----------------------------- | ------- | --------- |
| Phase 1     | 유틸 함수                     | 2       | 18        |
| Phase 2     | 커스텀 훅                     | 7       | 87        |
| Phase 3     | 스토어                        | 3       | 39        |
| Phase 4     | MSW CRUD                      | 1       | 12        |
| **Phase 5** | 통합 테스트 (페이지/컴포넌트) | **3**   | **8**     |
| **합계**    | -                             | **16**  | **164**   |

---

**작성일**: 2025-12-04
