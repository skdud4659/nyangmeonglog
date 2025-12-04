# 🎓 Phase 5 (E2E): Playwright로 사용자 여정 끝까지 따라가기

## 📊 E2E 테스트 개요

- **도구**: Playwright (`@playwright/test`)
- **테스트 위치**: `e2e/` 디렉터리
- **테스트 대상 플로우(1차)**:
  - 로그인 페이지 렌더링 및 기본 UX 검증
  - 이메일/비밀번호 입력에 따른 버튼 활성화
  - 잘못된 이메일 형식에 대한 로컬 검증 메시지

이 문서는 **Phase 5 통합 테스트를 바탕으로**,  
실제 브라우저 환경에서 Playwright로 E2E 테스트를 추가한 내용을 정리합니다.

---

## 🔍 통합 테스트 vs E2E 테스트 (이 프로젝트 기준)

### 통합 테스트 (Phase 5 - 기존 문서)

- **환경**: Vitest + Testing Library + happy-dom
- **범위**:
  - 컴포넌트 + 훅 + 스토어 + (모킹된) API 모듈 + 라우팅
- **목적**:
  - 우리 앱 코드 레이어들이 **서로 잘 연결되어 있는지** 빠르게 검증
  - 예: `LoginPage`에서
    - 입력 → `useLoginForm` 검증 → Supabase 모듈 호출 → `useNavigate` 실행까지 테스트

### E2E 테스트 (이 문서에서 다루는 내용)

- **환경**: Playwright + 실제 브라우저(Chromium)
- **범위**:
  - Vite dev 서버로 띄운 **실제 앱 번들** + 브라우저 상호작용
  - (1차 단계에서는 네트워크 통신 전까지의 UX에 초점)
- **목적**:
  - 실제 브라우저에서 **유저가 보는 화면과 상호작용**이 기대대로 동작하는지 확인
  - 예: `/auth/login` 페이지가 제대로 열리고,
    - 입력 필드/버튼이 보이는지
    - 입력에 따라 버튼 disabled/enabled 상태가 잘 바뀌는지

요약하면:

- **통합 테스트**: “코드 레벨에서 유저 시나리오를 빠르고 안정적으로 검증”
- **E2E 테스트**: “브라우저 + 빌드 + 라우팅까지 포함한 실제 환경에서 한 번 더 확인”

---

## 🛠 Playwright 환경 설정

### 1. 설치

```bash
npm install --save-dev @playwright/test

# 브라우저 바이너리 설치 (최초 1회)
npx playwright install
```

### 2. 설정 파일 (`playwright.config.ts`)

- 위치: 프로젝트 루트 `playwright.config.ts`
- 주요 설정:
  - `testDir: './e2e'` → E2E 테스트 파일 저장 위치
  - `baseURL: 'http://localhost:5173'` → Vite dev 서버 주소
  - `webServer`:
    - `command: 'npm run dev'`
    - 테스트 시작 전에 dev 서버를 자동으로 띄우고, 종료 시 정리
  - 기본 프로젝트: `chromium` (Desktop Chrome)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
```

### 3. 실행 명령어

```bash
# E2E 전체 실행
npx playwright test

# 특정 파일만 실행
npx playwright test e2e/auth-login.spec.ts

# UI 모드(테스트 탐색기) - 원하는 경우
npx playwright test --ui
```

---

## 📁 E2E 테스트 1: 로그인 페이지 UX 검증

### 테스트 파일 구조

```text
e2e/
└── auth-login.spec.ts   # 로그인 페이지 관련 E2E 테스트
```

### 시나리오 1: 로그인 페이지 렌더링

```ts
test('로그인 페이지가 정상적으로 렌더링된다', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(
        page.getByRole('heading', {
            name: /냥멍일지에 오신 것을 환영해요/i,
        }),
    ).toBeVisible();

    await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();

    const loginButton = page.getByRole('button', { name: '로그인' });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeDisabled();
});
```

**핵심 포인트**

- `/auth/login` 라우트가 실제 dev 서버에서 제대로 연결되어 있는지 확인
- Testing Library와 비슷하게 `getByRole`, `getByLabel`을 사용해 **실제 사용자가 보는 요소 기준으로 검증**
- 초기 상태에서 로그인 버튼이 **disabled** 인지 직접 확인 (통합 테스트와 같은 UX 규칙을 E2E로 재확인)

---

### 시나리오 2: 입력에 따른 버튼 활성화

```ts
test('이메일과 비밀번호를 입력하면 로그인 버튼이 활성화된다', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.getByPlaceholder('이메일을 입력하세요');
    const passwordInput = page.getByPlaceholder('비밀번호를 입력하세요');
    const loginButton = page.getByRole('button', { name: '로그인' });

    await emailInput.fill('user@test.com');
    await passwordInput.fill('password123');

    await expect(loginButton).toBeEnabled();
});
```

**핵심 포인트**

- 이 테스트는 **Supabase 통신과 무관**하게,  
  `useLoginForm`의 `isFormValid` 로직이 실제 브라우저 환경에서도 버튼 disabled 상태와 잘 연결되어 있는지 확인합니다.
- Phase 5 통합 테스트에서 Vitest + happy-dom으로 검증했던 내용을  
  Playwright로 “진짜 브라우저”에서 한 번 더 확인하는 셈입니다.

---

### 시나리오 3: 잘못된 이메일 형식에 대한 로컬 에러 메시지

```ts
test('잘못된 이메일 형식으로 제출하면 에러 메시지가 노출된다 (로컬 검증)', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.getByPlaceholder('이메일을 입력하세요');
    const passwordInput = page.getByPlaceholder('비밀번호를 입력하세요');
    const loginButton = page.getByRole('button', { name: '로그인' });

    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await loginButton.click();

    await expect(
        page.getByText(/올바른 이메일 형식이 아닙니다/i),
    ).toBeVisible();
});
```

**핵심 포인트**

- 이 테스트 역시 네트워크 호출 전에 일어나는 **Zod 스키마 검증 (로컬 검증)** 만을 대상으로 합니다.
- 백엔드/Supabase 환경이 세팅되지 않아도 **안전하게 돌릴 수 있는 E2E** 시나리오입니다.

---

## 🌉 지금까지의 E2E는 어디까지, 다음은 어디까지?

현재 E2E 테스트는 **“로그인 페이지의 초기 UX”** 에 집중하고 있습니다.

- 다루는 범위:
  - 라우팅(`/auth/login`)이 정상적으로 동작하는지
  - 컴포넌트/훅/스타일이 번들된 상태에서 브라우저에서 잘 렌더링되는지
  - 입력 → 버튼 상태 → 로컬 검증 메시지까지의 UX 흐름
- 아직 다루지 않은 것:
  - 실제 Supabase 인증 서버와의 통신
  - 로그인 성공 후 메인 페이지 진입까지의 **완전한 end-to-end 플로우**

### 다음 단계 아이디어 (심화 E2E)

- **테스트용 Supabase 계정**을 하나 만들고:
  - Playwright에서 실제 이메일/비밀번호로 로그인 시도
  - 로그인 성공 후 `/main/home`으로 리다이렉션되는지 확인
- 온보딩 E2E:
  - 처음 로그인한 계정으로 `/auth/signup` → 온보딩 Step들을 실제로 모두 진행 → 메인 홈 도달 여부

이 단계들은 백엔드/테스트 계정/데이터 초기화 전략까지 함께 고민해야 해서,  
Phase 5의 “기초 E2E”를 충분히 익힌 뒤 **별도 Phase로 확장**하는 것이 좋습니다.

---

## 📂 E2E 관련 파일 구조

```text
nyangmeonglog/
├── playwright.config.ts        # Playwright 전역 설정
└── e2e/
    └── auth-login.spec.ts      # 로그인 페이지 E2E 테스트
```

---

## ⚠️ E2E 테스트 실행 전 필수 사항

### 환경 변수 설정

E2E 테스트는 **실제 dev 서버를 띄워서** 브라우저로 접근하므로,
Supabase 등 외부 서비스 연결을 위한 환경 변수가 필요합니다.

```bash
# 1. .env 파일 생성
cp .env.example .env

# 2. .env 파일에 실제 값 입력
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **주의**: 환경 변수가 없으면 앱이 브라우저에서 렌더링되지 않아
> 모든 E2E 테스트가 빈 화면에서 타임아웃됩니다.

---

## 🔧 E2E 테스트 트러블슈팅

### 브라우저에서 빈 화면이 나오는 경우

**증상**: Playwright 스크린샷이 완전히 빈 화면

**원인**:

1. `.env` 파일이 없거나 Supabase 환경 변수가 설정되지 않음
2. 앱 시작 시점에 JavaScript 에러 발생

**해결**:

```bash
# 1. dev 서버 직접 실행해서 브라우저 콘솔 확인
npm run dev

# 2. http://localhost:5173/auth/login 접속 후 개발자 도구 확인
```

### Vitest와 Playwright 테스트 분리

E2E 테스트 파일(`e2e/*.spec.ts`)이 `npm test`(Vitest)에서 실행되지 않도록:

```typescript
// vitest.config.ts
export default defineConfig({
    test: {
        exclude: ['**/node_modules/**', '**/e2e/**'],
    },
});
```

---

**작성일**: 2025-12-04
**Phase**: 5 (E2E) - Playwright로 로그인 UX E2E 테스트 작성
**다음 Phase 아이디어**:

- Supabase 테스트 계정과 함께 실제 로그인 성공 → 메인 홈 진입까지의 풀 E2E
- 온보딩 시나리오(회원가입 → 온보딩 → 메인) 전체를 하나의 긴 E2E로 작성해 보기



