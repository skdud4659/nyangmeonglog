# 🧪 테스팅 스터디 가이드

## 📊 전체 테스트 현황

- **총 테스트 파일**: 13개
- **총 테스트 케이스**: 138개 (모두 통과 ✅)

---

## 📚 Phase별 학습 가이드

### [Phase 1: 유틸리티 단위 테스트](./phase1-util-unit-tests.md)
- **테스트 대상**: 순수 함수 (date, push)
- **학습 목표**: describe/it/expect, 경계값 테스트, 시간 모킹
- **테스트 수**: 18개

### [Phase 2: 커스텀 훅 테스트](./phase2-custom-hooks-tests.md)
- **테스트 대상**: React 커스텀 훅 7개
- **학습 목표**: renderHook, act, waitFor, API 모킹
- **테스트 수**: 69개

### [Phase 3: 스토어 테스트](./phase3-store-tests.md)
- **테스트 대상**: Zustand 스토어 3개
- **학습 목표**: 상태 격리, 스토어 간 의존성, persist 테스트
- **테스트 수**: 39개

### [Phase 4: MSW 기초](./phase4-msw-intro.md)
- **테스트 대상**: 네트워크 레벨 API 모킹
- **학습 목표**: MSW 설정, CRUD 핸들러, vi.mock vs MSW 비교
- **테스트 수**: 12개

---

## 🎯 테스트 커버리지 요약

| Phase | 대상 | 파일 수 | 테스트 수 |
| --- | --- | --- | --- |
| Phase 1 | 유틸 함수 | 2 | 18 |
| Phase 2 | 커스텀 훅 | 7 | 69 |
| Phase 3 | 스토어 | 3 | 39 |
| Phase 4 | MSW CRUD | 1 | 12 |
| **합계** | - | **13** | **138** |

---

## 🛠 테스트 실행 방법

```bash
# 전체 테스트 실행
npm test

# 특정 파일 테스트
npm test -- src/shared/store/__tests__/authStore.test.ts

# 특정 폴더 테스트
npm test -- src/shared/store/__tests__/

# UI 모드로 실행
npm run test:ui

# 커버리지 리포트
npm run test:coverage
```

---

## 📂 테스트 파일 구조

```
src/
├── mocks/                            (Phase 4)
│   ├── handlers.ts
│   ├── server.ts
│   └── __tests__/
│       └── msw-crud.test.ts
├── setupTests.ts                     (Phase 4)
├── shared/
│   ├── lib/__tests__/
│   │   ├── date.test.ts              (Phase 1)
│   │   └── push.test.ts              (Phase 1)
│   └── store/__tests__/
│       ├── authStore.test.ts         (Phase 3)
│       ├── settingsStore.test.ts     (Phase 3)
│       └── petStore.test.ts          (Phase 3)
└── features/
    ├── onBoarding/hooks/__tests__/
    │   ├── usePetCount.test.ts       (Phase 2)
    │   ├── useOwnerInfo.test.ts      (Phase 2)
    │   ├── useModeSelection.test.ts  (Phase 2)
    │   ├── usePetDetails.test.ts     (Phase 2)
    │   └── useOnboardingFlow.test.ts (Phase 2)
    └── auth/hooks/__tests__/
        ├── useLoginForm.test.ts      (Phase 2)
        └── useSignupForm.test.ts     (Phase 2)
```

---

## 🔑 핵심 학습 포인트

### Phase 1에서 배운 것
- AAA 패턴 (Arrange-Act-Assert)
- 경계값 테스트
- 시간 모킹 (`vi.useFakeTimers`)

### Phase 2에서 배운 것
- `renderHook()`으로 훅 테스트
- `act()`로 상태 변경 래핑
- `vi.mock()`으로 API 모킹
- Zod 검증 테스트

### Phase 3에서 배운 것
- `setState()`로 테스트 간 상태 격리
- 스토어 간 의존성 관리
- persist 미들웨어 테스트
- 복잡한 비즈니스 로직 테스트

### Phase 4에서 배운 것
- MSW로 네트워크 레벨 모킹
- `vi.mock()` vs MSW 비교
- 인메모리 DB 패턴
- CRUD 핸들러 작성

---

**마지막 업데이트**: 2025-11-26
