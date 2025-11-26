# 🎓 Phase 3: 스토어 테스트 학습 가이드

## 📊 테스트 결과 요약

- **총 테스트 파일**: 3개
- **총 테스트 케이스**: 39개 (모두 통과 ✅)
- **테스트 대상 스토어**: 3개
  - `authStore` - 9개 테스트 (인증 상태 관리)
  - `settingsStore` - 10개 테스트 (앱 설정 + persist)
  - `petStore` - 20개 테스트 (복합 스토어 + 스토어 간 의존성)

---

# 🤔 왜 스토어 테스트가 필요한가?

## 스토어는 비즈니스 로직의 중심

```
컴포넌트 → 스토어 액션 호출 → 상태 변경 → UI 업데이트
              ↑
         여기를 테스트!
```

**스토어 테스트의 장점**:
- **격리된 테스트**: 컴포넌트 없이 순수하게 상태 로직만 검증
- **빠른 실행**: UI 렌더링 없이 바로 상태 검증
- **신뢰성**: 상태 전이 로직이 정확한지 확인

---

# 📁 테스트 1: 인증 스토어 (authStore)

## 🎯 테스트 대상

`src/shared/store/authStore.ts` - Zustand 기반 인증 상태 관리

**주요 기능**:
- 세션/유저 상태 관리
- Supabase 인증 연동
- 인증 상태 변경 리스너

## 핵심 테스트 패턴

### 1. 스토어 초기화 패턴 (테스트 간 오염 방지)

```typescript
beforeEach(() => {
    vi.clearAllMocks();

    // Zustand 스토어 초기화 패턴 ⭐
    useAuthStore.setState({
        session: null,
        user: null,
        isInitialized: false,
    });
});
```

**학습 포인트**
- `setState()`로 스토어를 초기 상태로 리셋
- 테스트 간 상태 오염 방지의 핵심
- `beforeEach`에서 매번 초기화

### 2. 비동기 액션 테스트

```typescript
it('세션이 있을 때 user와 session이 설정된다', async () => {
    // Arrange
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token-123' };
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });

    // Act
    await act(async () => {
        await useAuthStore.getState().initialize();
    });

    // Assert
    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.user).toEqual(mockUser);
    expect(state.isInitialized).toBe(true);
});
```

**학습 포인트**
- `getState()`로 스토어의 액션 직접 호출
- `await act(async () => ...)` 로 비동기 액션 래핑
- API 모킹과 결합

### 3. 콜백 리스너 테스트

```typescript
it('인증 상태 변경 시 스토어가 업데이트된다', async () => {
    // Arrange - 콜백 캡처
    let authChangeCallback: any;
    mockOnAuthStateChange.mockImplementation(callback => {
        authChangeCallback = callback;
    });

    await act(async () => {
        await useAuthStore.getState().initialize();
    });

    // Act - 인증 상태 변경 시뮬레이션
    const newSession = { user: { id: 'new-user' }, access_token: 'new-token' };
    act(() => {
        authChangeCallback('SIGNED_IN', newSession);
    });

    // Assert
    expect(useAuthStore.getState().session).toEqual(newSession);
});
```

**학습 포인트**
- 콜백 함수를 캡처하여 나중에 호출
- 이벤트 기반 상태 변경 테스트
- Supabase `onAuthStateChange` 패턴

### 4. 상태 격리 검증 테스트

```typescript
describe('테스트 간 상태 격리', () => {
    it('첫 번째 테스트: 상태 변경', () => {
        useAuthStore.setState({
            user: { id: 'test-user' } as any,
            isInitialized: true,
        });
        expect(useAuthStore.getState().user?.id).toBe('test-user');
    });

    it('두 번째 테스트: 상태가 초기화되어 있어야 함', () => {
        // beforeEach에서 초기화되었으므로 null이어야 함
        expect(useAuthStore.getState().user).toBeNull();
    });
});
```

**학습 포인트**
- 테스트 간 상태가 격리되는지 직접 검증
- `beforeEach` 초기화의 중요성 입증

---

# 📁 테스트 2: 설정 스토어 (settingsStore)

## 🎯 테스트 대상

`src/shared/store/settingsStore.ts` - persist 미들웨어 사용

**주요 기능**:
- 앱 모드 설정 (simple/detail)
- localStorage 영속화 (persist)
- DB 동기화

## 핵심 테스트 패턴

### 1. persist 미들웨어 테스트

```typescript
describe('persist 미들웨어', () => {
    it('스토어 이름이 설정되어 있다', () => {
        const persistOptions = (useSettingsStore as any).persist?.getOptions?.();
        expect(persistOptions?.name).toBe('nyangmeonglog-settings');
    });
});
```

**학습 포인트**
- persist 미들웨어의 설정 확인
- 내부 속성 접근 시 `as any` 사용
- 스토어 이름으로 localStorage 키 확인

### 2. 로컬 상태 + DB 동기화 테스트

```typescript
it('setMode 호출 시 로그인된 사용자의 DB가 업데이트된다', async () => {
    // Arrange
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUpdate.mockResolvedValue({ error: null });

    // Act
    await act(async () => {
        await useSettingsStore.getState().setMode('detail');
    });

    // Assert - 로컬 상태 변경
    expect(useSettingsStore.getState().mode).toBe('detail');
    // Assert - DB 업데이트
    expect(mockUpdate).toHaveBeenCalledWith({ mode: 'detail' });
});

it('로그인하지 않은 경우 DB 업데이트를 시도하지 않는다', async () => {
    // Arrange
    mockGetUser.mockResolvedValue({ data: { user: null } });

    // Act
    await act(async () => {
        await useSettingsStore.getState().setMode('detail');
    });

    // Assert
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(useSettingsStore.getState().mode).toBe('detail'); // 로컬은 변경됨
});
```

**학습 포인트**
- 로컬 상태와 서버 동기화 분리 테스트
- 조건부 API 호출 검증
- 오프라인 지원 로직 테스트

---

# 📁 테스트 3: 펫 스토어 (petStore)

## 🎯 테스트 대상

`src/shared/store/petStore.ts` - 가장 복잡한 스토어

**주요 기능**:
- 펫 목록 관리
- 활성 펫 선택 (우선순위 로직)
- 다른 스토어(authStore) 참조
- persist + partialize

## 핵심 테스트 패턴

### 1. 스토어 간 의존성 테스트

```typescript
describe('스토어 간 의존성', () => {
    it('authStore의 user를 참조하여 동작한다', async () => {
        // Arrange - authStore에 user 설정
        useAuthStore.setState({ user: { id: 'user-456' } as any });
        mockGetUserPets.mockResolvedValue(mockPets);

        // Act
        await act(async () => {
            await usePetStore.getState().loadPetsForCurrentUser();
        });

        // Assert
        expect(mockGetUserPets).toHaveBeenCalledWith('user-456');
    });
});
```

**학습 포인트**
- 스토어 간 의존성이 있을 때 두 스토어 모두 초기화
- `authStore.getState().user`로 다른 스토어 접근
- 의존 스토어 먼저 설정 후 테스트

### 2. 복잡한 우선순위 로직 테스트

```typescript
describe('activePetId 우선순위', () => {
    it('현재 activePetId가 유효하면 유지한다', async () => {
        // Arrange
        usePetStore.setState({ activePetId: 'pet-2' });
        mockGetActivePetId.mockResolvedValue('pet-1'); // DB에는 다른 값

        // Act
        await act(async () => {
            await usePetStore.getState().loadPetsForCurrentUser();
        });

        // Assert - 현재 값 유지
        expect(usePetStore.getState().activePetId).toBe('pet-2');
    });

    it('현재 activePetId가 없으면 DB 값을 사용한다', async () => {
        // Arrange
        usePetStore.setState({ activePetId: null });
        mockGetActivePetId.mockResolvedValue('pet-2');

        // Act & Assert
        // ...
    });

    it('현재 값과 DB 값 모두 없으면 첫 번째 펫을 선택한다', async () => {
        // ...
    });
});
```

**학습 포인트**
- 우선순위 로직의 각 경우를 개별 테스트
- `describe` 중첩으로 관련 테스트 그룹화
- 경계 조건 (빈 목록, 삭제된 펫) 테스트

### 3. partialize 테스트 (부분 영속화)

```typescript
it('activePetId만 persist된다 (partialize)', () => {
    const persistOptions = (usePetStore as any).persist?.getOptions?.();
    expect(persistOptions?.name).toBe('nyangmeonglog-pet');

    // partialize 함수 테스트
    const state = { pets: mockPets, activePetId: 'pet-1', isLoading: false };
    const partializedState = persistOptions?.partialize?.(state as any);
    expect(partializedState).toEqual({ activePetId: 'pet-1' }); // pets, isLoading 제외
});
```

**학습 포인트**
- `partialize` 함수로 일부 상태만 영속화
- 민감하거나 큰 데이터는 제외 (pets 목록)
- 영속화 설정 검증

### 4. 셀렉터 훅 테스트

```typescript
describe('useActivePet 셀렉터', () => {
    it('활성 펫을 반환한다', () => {
        // Arrange
        usePetStore.setState({
            pets: mockPets as any,
            activePetId: 'pet-2',
        });

        // Act
        const { result } = renderHook(() => useActivePet());

        // Assert
        expect(result.current?.id).toBe('pet-2');
        expect(result.current?.name).toBe('야옹이');
    });
});
```

**학습 포인트**
- 파생 데이터(derived state) 테스트
- `renderHook`으로 커스텀 셀렉터 테스트
- `undefined` 반환 케이스 검증

---

# 🎓 핵심 API 정리

| API | 용도 | 예시 |
| --- | --- | --- |
| `useStore.getState()` | 스토어 상태/액션 직접 접근 | `useAuthStore.getState().initialize()` |
| `useStore.setState()` | 스토어 상태 직접 설정 | `useAuthStore.setState({ user: null })` |
| `beforeEach` + `setState` | 테스트 간 상태 격리 | 매 테스트 전 초기화 |
| `vi.mock()` | API 모킹 | `vi.mock('@/shared/lib/supabase', ...)` |
| `(store as any).persist` | persist 내부 접근 | 설정 검증용 |
| `renderHook()` | 셀렉터 훅 테스트 | `renderHook(() => useActivePet())` |

---

# 🚀 스터디 발제 주제

## 1. 테스트 간 상태 오염 방지

**주제**: "왜 각 테스트 전에 스토어를 초기화해야 할까?"

**핵심 내용**:
- Zustand 스토어는 **싱글톤**으로 모든 테스트가 공유
- 이전 테스트의 상태가 다음 테스트에 영향
- `beforeEach` + `setState()`로 매번 초기화

**토론 질문**:
- 상태 초기화 없이 테스트를 실행하면 어떤 문제가 발생할까?
- Redux에서는 어떻게 테스트 격리를 할까?

**답변**:

> **Q: 상태 초기화 없이 테스트를 실행하면 어떤 문제가 발생할까?**
>
> 1. **테스트 순서 의존성**: 테스트 A에서 `user`를 설정했는데, 테스트 B가 "로그인 안 된 상태"를 테스트하려 해도 이미 `user`가 있음
> 2. **비결정적 실패**: 테스트를 단독 실행하면 성공, 전체 실행하면 실패 (또는 그 반대)
> 3. **디버깅 어려움**: 어느 테스트가 상태를 오염시켰는지 추적하기 어려움
> 4. **CI/CD 불안정**: 랜덤 실행 순서로 인해 때때로 실패하는 "flaky test" 발생

> **Q: Redux에서는 어떻게 테스트 격리를 할까?**
>
> Redux는 Zustand와 달리 **매 테스트마다 새로운 스토어를 생성**하는 것이 일반적:
> ```typescript
> // Redux 패턴
> const createTestStore = () => configureStore({ reducer: rootReducer });
>
> it('테스트', () => {
>     const store = createTestStore(); // 매번 새 스토어
>     // ...
> });
> ```
> Zustand는 싱글톤이라 `setState()`로 초기화하는 반면, Redux는 스토어 인스턴스를 새로 만드는 차이가 있습니다.

---

## 2. 스토어 간 의존성 관리

**주제**: "한 스토어가 다른 스토어를 참조할 때 테스트하는 방법"

**핵심 내용**:
- petStore는 authStore의 `user`를 참조
- 테스트 시 의존하는 스토어도 함께 설정
- 의존성 방향을 명확히 파악

**코드 예시**:
```typescript
beforeEach(() => {
    // 의존 스토어 먼저 초기화
    useAuthStore.setState({ user: null });
    // 테스트 대상 스토어 초기화
    usePetStore.setState({ pets: [], activePetId: null });
});

it('authStore의 user가 있어야 펫을 로드한다', async () => {
    useAuthStore.setState({ user: { id: 'user-123' } });
    // ...
});
```

**토론 질문**:
- 스토어 간 의존성이 복잡해지면 어떤 문제가 발생할까?
- 의존성을 줄이는 설계 방법은?

**답변**:

> **Q: 스토어 간 의존성이 복잡해지면 어떤 문제가 발생할까?**
>
> 1. **테스트 복잡도 증가**: A → B → C 의존 시 테스트하려면 3개 스토어 모두 설정 필요
> 2. **순환 의존성 위험**: A가 B를 참조하고, B가 A를 참조하면 무한 루프 가능
> 3. **초기화 순서 문제**: 어떤 스토어를 먼저 초기화해야 하는지 혼란
> 4. **변경 영향 범위 확대**: 한 스토어 수정 시 의존하는 모든 스토어 테스트 깨질 수 있음

> **Q: 의존성을 줄이는 설계 방법은?**
>
> 1. **파라미터로 받기**: 스토어 내부에서 다른 스토어 참조 대신, 액션 호출 시 필요한 값을 파라미터로 받기
>    ```typescript
>    // Before: 스토어 직접 참조
>    loadPets: async () => {
>        const userId = useAuthStore.getState().user?.id;
>    }
>
>    // After: 파라미터로 받기
>    loadPets: async (userId: string) => { ... }
>    ```
> 2. **셀렉터 분리**: 스토어 로직과 파생 데이터 계산 분리
> 3. **이벤트 기반**: 직접 참조 대신 이벤트/구독 패턴 사용 (느슨한 결합)

---

## 3. persist 미들웨어 테스트

**주제**: "영속화된 상태를 어떻게 테스트할까?"

**핵심 내용**:
- persist 미들웨어로 localStorage 저장
- `partialize`로 일부 상태만 영속화
- 테스트에서 persist 설정 검증

**우리 프로젝트 사례**:
```typescript
// petStore - activePetId만 영속화
persist(
    (set) => ({ ... }),
    {
        name: 'nyangmeonglog-pet',
        partialize: state => ({ activePetId: state.activePetId }),
    }
)
```

**토론 질문**:
- 왜 `pets` 목록은 영속화하지 않았을까?
- 민감한 정보(토큰 등)는 어디에 저장해야 할까?

**답변**:

> **Q: 왜 `pets` 목록은 영속화하지 않았을까?**
>
> 1. **데이터 신선도**: 펫 목록은 서버에서 항상 최신 데이터를 가져와야 함 (다른 기기에서 수정했을 수 있음)
> 2. **용량 문제**: 펫 정보에 사진 URL, 상세 정보 등이 포함되어 localStorage 용량 제한(보통 5MB)에 부담
> 3. **동기화 복잡성**: 로컬 캐시와 서버 데이터 간 충돌 해결이 복잡해짐
> 4. **activePetId만 필요**: 사용자가 마지막으로 선택한 펫 ID만 기억하면, 앱 시작 시 해당 펫을 바로 표시 가능
>
> 반면 `activePetId`는 단순한 문자열이고, 서버 데이터와 충돌 가능성이 낮아 영속화에 적합합니다.

> **Q: 민감한 정보(토큰 등)는 어디에 저장해야 할까?**
>
> | 저장소 | 적합한 데이터 | 부적합한 데이터 |
> | --- | --- | --- |
> | **localStorage** | 앱 설정, 선택한 펫 ID, UI 상태 | 토큰, 비밀번호, 개인정보 |
> | **sessionStorage** | 임시 폼 데이터, 탭별 상태 | 장기 저장 필요한 데이터 |
> | **httpOnly 쿠키** | 인증 토큰 (서버 설정) | 클라이언트 접근 필요한 데이터 |
> | **메모리 (스토어)** | 세션 중 필요한 민감 정보 | 페이지 새로고침 후에도 필요한 데이터 |
>
> **Supabase의 경우**: Supabase는 자체적으로 토큰을 localStorage에 저장하지만, `httpOnly` 쿠키 옵션도 제공합니다. 프로덕션에서는 쿠키 기반 인증이 더 안전합니다.

---

## 4. 비동기 스토어 액션과 로딩 상태

**주제**: "비동기 액션 중 로딩 상태를 어떻게 테스트할까?"

**핵심 내용**:
- `isLoading` 상태의 전이 검증
- Promise가 해결되기 전/후 상태 확인
- finally 블록으로 항상 로딩 해제

**코드 예시**:
```typescript
it('로딩 중 isLoading이 true가 된다', async () => {
    let resolveGetPets: any;
    mockGetUserPets.mockReturnValue(
        new Promise(resolve => { resolveGetPets = resolve; })
    );

    // 로딩 시작
    const loadPromise = usePetStore.getState().loadPetsForCurrentUser();
    expect(usePetStore.getState().isLoading).toBe(true); // 로딩 중

    // 로딩 완료
    await act(async () => {
        resolveGetPets(mockPets);
        await loadPromise;
    });
    expect(usePetStore.getState().isLoading).toBe(false); // 완료
});
```

**토론 질문**:
- 로딩 중 다른 액션이 호출되면 어떻게 처리해야 할까?
- 에러 발생 시에도 로딩 상태는 해제되어야 할까?

**답변**:

> **Q: 로딩 중 다른 액션이 호출되면 어떻게 처리해야 할까?**
>
> 여러 가지 전략이 있습니다:
>
> 1. **무시 (Ignore)**: 이미 로딩 중이면 새 요청 무시
>    ```typescript
>    loadPets: async () => {
>        if (get().isLoading) return; // 이미 로딩 중이면 무시
>        set({ isLoading: true });
>        // ...
>    }
>    ```
>
> 2. **취소 후 재요청 (Cancel & Restart)**: 이전 요청 취소하고 새 요청 실행
>    ```typescript
>    // AbortController 사용
>    let controller: AbortController | null = null;
>
>    loadPets: async () => {
>        controller?.abort(); // 이전 요청 취소
>        controller = new AbortController();
>        // fetch with signal: controller.signal
>    }
>    ```
>
> 3. **큐잉 (Queue)**: 요청을 큐에 저장했다가 순차 실행
>
> **우리 프로젝트**: 현재 petStore는 별도 처리 없이 중복 호출을 허용합니다. 대부분의 경우 앱 시작 시 한 번만 호출되므로 문제없지만, 버튼 연타 등의 케이스에서는 "무시" 패턴이 좋습니다.

> **Q: 에러 발생 시에도 로딩 상태는 해제되어야 할까?**
>
> **반드시 해제해야 합니다!** 그렇지 않으면 UI가 영원히 로딩 상태에 갇힙니다.
>
> ```typescript
> loadPets: async () => {
>     set({ isLoading: true });
>     try {
>         const pets = await getUserPets(userId);
>         set({ pets, isLoading: false });
>     } catch (error) {
>         set({ isLoading: false, error }); // ⚠️ 에러 시에도 로딩 해제
>     }
>     // 또는 finally 블록 사용
> }
> ```
>
> **테스트 관점**:
> ```typescript
> it('에러 발생 시에도 isLoading이 false가 된다', async () => {
>     mockGetUserPets.mockRejectedValue(new Error('API 에러'));
>
>     await act(async () => {
>         await usePetStore.getState().loadPetsForCurrentUser();
>     });
>
>     expect(usePetStore.getState().isLoading).toBe(false); // 반드시 해제
> });
> ```

---

# 📚 다음 단계

### Phase 4 예정: 컴포넌트 테스트
- UI 렌더링 테스트
- 사용자 이벤트 시뮬레이션
- 스토어와 컴포넌트 통합 테스트

---

# ✅ 완료된 작업

1. ✅ 프로젝트 스토어 구조 분석 (Zustand 3개 스토어)
2. ✅ `authStore` 9개 테스트 (인증 + 리스너)
3. ✅ `settingsStore` 10개 테스트 (persist + DB 동기화)
4. ✅ `petStore` 20개 테스트 (복합 로직 + 스토어 의존성)
5. ✅ 테스트 간 상태 격리 패턴 적용
6. ✅ 총 39개 스토어 테스트 모두 통과

---

# 📂 테스트 파일 구조

```
src/shared/store/
├── __tests__/
│   ├── authStore.test.ts        (9 tests)
│   ├── settingsStore.test.ts    (10 tests)
│   └── petStore.test.ts         (20 tests)
├── authStore.ts
├── settingsStore.ts
└── petStore.ts
```

---

**작성일**: 2025-11-26
