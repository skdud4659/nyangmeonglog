# 🎓 Phase 2: 커스텀 훅 테스트 학습 가이드

## 📊 테스트 결과 요약

- **총 테스트 파일**: 7개
- **총 테스트 케이스**: 87개 (모두 통과 ✅)
- **테스트 대상 훅**: 7개
  - `usePetCount` - 9개 테스트
  - `useOwnerInfo` - 9개 테스트
  - `useLoginForm` - 10개 테스트
  - `useSignupForm` - 13개 테스트
  - `useModeSelection` - 5개 테스트
  - `usePetDetails` - 9개 테스트
  - `useOnboardingFlow` - 14개 테스트

---

# 📁 테스트 1: 간단한 상태 관리 훅 (usePetCount)

## 🎯 테스트 대상

`src/features/onBoarding/hooks/usePetCount.ts` - 펫 개수 선택 훅

**검증 규칙**:
- 각 펫 타입: 0-4마리
- 전체 합계: 최소 1마리, 최대 4마리

## 핵심 테스트 케이스

### 1. 기본 패턴: renderHook 사용

```typescript
it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() => usePetCount());

    expect(result.current.petCount).toEqual({
        dogs: 0,
        cats: 1,
    });
});
```

**학습 포인트**
- `renderHook()`: React 훅을 테스트하기 위한 핵심 함수
- `result.current`: 훅이 반환하는 현재 값에 접근

### 2. 상태 변경 테스트: act() 사용

```typescript
it('setPetCount로 상태를 변경할 수 있다', () => {
    const { result } = renderHook(() => usePetCount());

    act(() => {
        result.current.setPetCount({ dogs: 2, cats: 1 });
    });

    expect(result.current.petCount).toEqual({ dogs: 2, cats: 1 });
});
```

**학습 포인트**
- **act()**: React 상태 업데이트를 감싸는 필수 함수
- act() 없이 상태를 변경하면 경고 발생

### 3. Zod 검증 테스트

```typescript
it('최소 1마리는 있어야 한다', () => {
    const { result } = renderHook(() => usePetCount());

    act(() => {
        result.current.setPetCount({ dogs: 0, cats: 0 });
    });

    expect(result.current.validate()).toBe(false);
});

it('최대 4마리까지만 허용된다', () => {
    const { result } = renderHook(() => usePetCount());

    act(() => {
        result.current.setPetCount({ dogs: 3, cats: 2 }); // 총 5마리
    });

    expect(result.current.validate()).toBe(false);
});
```

**학습 포인트**
- 비즈니스 로직 검증의 핵심
- 정상/실패 케이스 모두 테스트

---

# 📁 테스트 2: Zod 검증 훅 (useOwnerInfo)

## 🎯 테스트 대상

`src/features/onBoarding/hooks/useOwnerInfo.ts` - 견주 정보 관리 훅

**검증 규칙**:
- 이름: 필수, 1글자 이상 (trim 후)
- 사진: 선택사항

## 핵심 학습: 테스트로 버그 발견

### 처음 작성한 테스트 (실패)

```typescript
it('공백만 있는 이름은 유효하지 않다', () => {
    const { result } = renderHook(() => useOwnerInfo());

    act(() => {
        result.current.setOwnerInfo({ name: '   ', photo: '' });
    });

    expect(result.current.validate()).toBe(false);
});
```

**결과**: 테스트 실패! (실제로는 true 반환)

**원인**: Zod 스키마에 trim()이 없었음

### 버그 수정

```typescript
// ❌ 버그 있는 코드
export const ownerInfoSchema = z.object({
    name: z.string().min(1, '이름을 입력해주세요'),
});

// ✅ 수정된 코드
export const ownerInfoSchema = z.object({
    name: z.string().trim().min(1, '이름을 입력해주세요'),
});
```

**학습 포인트**
- **테스트가 코드 품질을 개선!**
- Zod의 `trim()`은 검증 전에 자동으로 공백 제거
- 실제 사용자 입력을 고려한 검증 로직의 중요성

---

# 📁 테스트 3: 비동기 훅 (useLoginForm)

## 🎯 테스트 대상

`src/features/auth/hooks/useLoginForm.ts` - 로그인 폼 관리 훅

**주요 기능**:
- 폼 상태 관리
- Zod 검증
- 비동기 Supabase 로그인

## 핵심 테스트 케이스

### 1. API 모킹 설정

```typescript
// 파일 상단
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}));

describe('useLoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // 각 테스트 전에 초기화
    });

    // 테스트들...
});
```

**학습 포인트**
- `vi.mock()`: 외부 의존성 모킹
- `beforeEach`에서 mock 초기화로 테스트 격리

### 2. 비동기 성공 케이스

```typescript
it('유효한 폼으로 로그인에 성공하면 onSuccess가 호출된다', async () => {
    // Arrange - Mock 설정
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: { user: { id: '123' } }, user: { id: '123' } },
        error: null,
    } as any);

    const { result } = renderHook(() => useLoginForm());
    const onSuccess = vi.fn();

    // Act
    act(() => {
        result.current.handleChange('email', 'test@example.com');
        result.current.handleChange('password', 'password123');
    });

    await act(async () => {
        await result.current.handleSubmit(onSuccess);
    });

    // Assert
    await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
    });
});
```

**학습 포인트**
- `mockResolvedValue()`: Promise를 반환하는 함수 모킹
- `await act(async () => ...)`: 비동기 상태 업데이트
- `waitFor()`: 비동기 상태 변화를 기다림
- `vi.fn()`: 호출 여부를 추적할 수 있는 목 함수

### 3. 비동기 실패 케이스

```typescript
it('로그인 실패 시 에러 메시지가 설정된다', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
    } as any);

    const { result } = renderHook(() => useLoginForm());

    act(() => {
        result.current.handleChange('email', 'test@example.com');
        result.current.handleChange('password', 'password123');
    });

    await act(async () => {
        await result.current.handleSubmit();
    });

    await waitFor(() => {
        expect(result.current.errors).toBeDefined();
        expect(result.current.isLoading).toBe(false);
    });
});
```

**학습 포인트**
- 성공/실패 케이스 모두 테스트
- 에러 상태 검증

### 4. UX 로직 테스트

```typescript
it('필드 변경 시 해당 필드의 에러가 클리어된다', async () => {
    const { result } = renderHook(() => useLoginForm());

    // 먼저 에러 발생
    act(() => {
        result.current.handleChange('email', 'test@example.com');
        result.current.handleChange('password', '123'); // 짧은 비밀번호
    });

    await act(async () => {
        await result.current.handleSubmit();
    });

    expect(result.current.errors.password).toBeDefined();

    // 필드 변경 시 에러 클리어
    act(() => {
        result.current.handleChange('password', 'newpassword123');
    });

    expect(result.current.errors.password).toBe('');
});
```

**학습 포인트**
- 사용자 경험 개선 로직 테스트
- 상태 전이 테스트 (에러 없음 → 에러 발생 → 에러 클리어)

---

# 📁 테스트 4: 복잡한 비동기 훅 (useSignupForm)

## 🎯 테스트 대상

`src/features/auth/hooks/useSignupForm.ts` - 회원가입 폼 관리 훅

**주요 기능**:
- 폼 상태 관리 (email, password, confirmPassword)
- Zod 검증 + 정규식 검증
- **2단계 비동기 호출**: signUp → signInWithPassword (자동 로그인)
- 에러 메시지 분기 처리

## 핵심 테스트 케이스

### 1. 정규식 검증 테스트

```typescript
it('비밀번호가 정규식 패턴을 만족하지 않으면 isFormValid가 false다', () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
        result.current.handleChange('email', 'test@example.com');
        result.current.handleChange('password', 'password'); // 숫자 없음
        result.current.handleChange('confirmPassword', 'password');
    });

    expect(result.current.isFormValid).toBe(false);
});
```

**학습 포인트**
- Zod 스키마 검증 외에 **computed 값 검증** 테스트
- `isFormValid`는 정규식 `/^(?=.*[A-Za-z])(?=.*\d).{8,}$/` 체크
- 영문 + 숫자 포함 8자 이상 패턴

### 2. 비밀번호 확인 검증

```typescript
it('비밀번호와 비밀번호 확인이 일치하지 않으면 isFormValid가 false다', () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
        result.current.handleChange('email', 'test@example.com');
        result.current.handleChange('password', 'password123');
        result.current.handleChange('confirmPassword', 'password456'); // 불일치
    });

    expect(result.current.isFormValid).toBe(false);
});
```

**학습 포인트**
- Zod의 `.refine()` 검증 테스트
- 두 필드 간의 관계 검증 (cross-field validation)

### 3. 2단계 API 호출 테스트

```typescript
it('회원가입과 자동 로그인에 성공하면 onSuccess가 호출된다', async () => {
    // Arrange - 두 개의 API 모킹
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { session: null, user: { id: '123' } },
        error: null,
    } as any);

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
    } as any);

    const { result } = renderHook(() => useSignupForm());
    const onSuccess = vi.fn();

    // Act
    await act(async () => {
        await result.current.handleSubmit(onSuccess);
    });

    // Assert - 두 API 모두 호출되었는지 확인
    await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalled();
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
    });
});
```

**학습 포인트**
- **연쇄 비동기 호출** 테스트: signUp 성공 → signInWithPassword 호출
- 두 개의 API를 각각 모킹
- 실제 구현에서 try-catch 안에 또 다른 try-catch가 있는 복잡한 플로우

### 4. 자동 로그인 실패 시나리오

```typescript
it('회원가입 성공 후 자동 로그인 실패 시 onAutoLoginFailure가 호출된다', async () => {
    // signUp은 성공, signInWithPassword는 실패
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { session: null, user: { id: '123' } },
        error: null,
    } as any);

    vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Auto login failed')
    );

    const onAutoLoginFailure = vi.fn();

    await act(async () => {
        await result.current.handleSubmit(undefined, onAutoLoginFailure);
    });

    await waitFor(() => {
        expect(onAutoLoginFailure).toHaveBeenCalled();
    });
});
```

**학습 포인트**
- `mockResolvedValue()` vs `mockRejectedValue()` 사용
- 중간 단계 실패 시나리오 테스트
- 콜백 함수 호출 검증

### 5. 에러 메시지 분기 처리

```typescript
it('에러 메시지에 password가 포함되면 password 필드에 에러가 설정된다', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
        error: { message: 'Password is too weak' } as any,
    } as any);

    await act(async () => {
        await result.current.handleSubmit();
    });

    await waitFor(() => {
        expect(result.current.errors.password).toBe('Password is too weak');
    });
});
```

**학습 포인트**
- 에러 메시지 내용에 따른 필드 분기 로직 테스트
- "password" 포함 → `errors.password`
- "email" 포함 → `errors.email`
- 그 외 → `errors.email` (기본값)

## useSignupForm vs useLoginForm 비교

| 구분 | useLoginForm | useSignupForm |
| --- | --- | --- |
| API 호출 수 | 1개 (signIn) | 2개 (signUp → signIn) |
| 검증 필드 | 2개 | 3개 (confirmPassword 추가) |
| 검증 방식 | Zod만 | Zod + 정규식 (isFormValid) |
| 에러 처리 | 단순 에러 설정 | 메시지 분기 처리 |
| 콜백 함수 | 1개 (onSuccess) | 2개 (onSuccess, onAutoLoginFailure) |
| 테스트 수 | 10개 | 13개 |

**학습 포인트**
- 같은 패턴의 훅이라도 복잡도에 따라 테스트 케이스 증가
- 2단계 비동기 호출은 중간 실패 시나리오도 테스트 필요

---

# 📁 테스트 5: Enum 검증 훅 (useModeSelection)

## 🎯 테스트 대상

`src/features/onBoarding/hooks/useModeSelection.ts` - 모드 선택 훅

**주요 기능**:
- 모드 선택 관리 (simple/detail)
- Zod의 `enum` 타입 검증

## 핵심 테스트 케이스

### 1. Enum 타입 검증

```typescript
it('setModeSettings로 simple 모드를 선택할 수 있다', () => {
    const { result } = renderHook(() => useModeSelection());

    act(() => {
        result.current.setModeSettings({ mode: 'simple' });
    });

    expect(result.current.modeSettings.mode).toBe('simple');
    expect(result.current.validate()).toBe(true);
});

it('simple과 detail 이외의 값은 허용되지 않는다', () => {
    const { result } = renderHook(() => useModeSelection());

    act(() => {
        // @ts-expect-error - 테스트를 위한 의도적인 타입 오류
        result.current.setModeSettings({ mode: 'invalid' });
    });

    expect(result.current.validate()).toBe(false);
});
```

**학습 포인트**
- Zod의 `z.enum()` 검증 테스트
- TypeScript 타입 오류를 의도적으로 무시하는 방법 (`@ts-expect-error`)
- 허용된 값/허용되지 않은 값 모두 테스트

---

# 📁 테스트 6: 배열 상태 관리 훅 (usePetDetails)

## 🎯 테스트 대상

`src/features/onBoarding/hooks/usePetDetails.ts` - 펫 상세 정보 관리 훅

**주요 기능**:
- 여러 펫의 상세 정보를 배열로 관리
- 특정 인덱스의 펫 정보 업데이트
- 인덱스별 검증

## 핵심 테스트 케이스

### 1. 배열 상태 업데이트

```typescript
it('updatePet으로 특정 인덱스의 펫 정보를 업데이트할 수 있다', () => {
    const { result } = renderHook(() => usePetDetails());

    const mockPets: PetInfoData[] = [
        { id: '1', name: '멍멍이', ... },
        { id: '2', name: '야옹이', ... },
    ];

    act(() => {
        result.current.setPets(mockPets);
    });

    // Act - 첫 번째 펫의 이름 변경
    act(() => {
        result.current.updatePet(0, { name: '뭉치' });
    });

    // Assert
    expect(result.current.pets[0].name).toBe('뭉치');
    expect(result.current.pets[1].name).toBe('야옹이'); // 다른 펫은 변경되지 않음
});
```

**학습 포인트**
- 배열 상태 관리 테스트
- 불변성 유지 확인 (다른 항목은 변경되지 않음)
- 인덱스 기반 업데이트 검증

### 2. 인덱스별 검증

```typescript
it('여러 펫을 관리할 수 있다', () => {
    const { result } = renderHook(() => usePetDetails());

    const mockPets: PetInfoData[] = [
        { id: '1', name: '멍멍이', ... },
        { id: '2', name: '야옹이', ... },
        { id: '3', name: '뽀삐', ... },
    ];

    act(() => {
        result.current.setPets(mockPets);
    });

    expect(result.current.pets).toHaveLength(3);
    expect(result.current.validate(0)).toBe(true);
    expect(result.current.validate(1)).toBe(true);
    expect(result.current.validate(2)).toBe(true);
});
```

**학습 포인트**
- 각 항목을 개별적으로 검증
- `validate(index)` 패턴으로 특정 항목만 검증

---

# 📁 테스트 7: 복합 훅 (useOnboardingFlow)

## 🎯 테스트 대상

`src/features/onBoarding/hooks/useOnboardingFlow.ts` - 온보딩 플로우 관리 훅

**주요 기능**:
- 여러 훅을 조합한 복합 훅 (`useOwnerInfo`, `usePetCount`, `usePetDetails`, `useModeSelection`)
- 다단계 플로우 관리 (5단계)
- Step별 검증 및 전환
- 펫 상세 정보 입력 시 펫 인덱스 관리

## 핵심 테스트 케이스

### 1. 복합 훅 테스트

```typescript
it('Step 0 (견주 정보)에 이름을 입력하면 유효해진다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
        result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
    });

    expect(result.current.isStepValid()).toBe(true);
});
```

**학습 포인트**
- 여러 훅을 조합한 훅 테스트
- 내부 훅의 상태를 통해 전체 플로우 검증
- `result.current.owner`, `result.current.petCount` 등 중첩된 접근

### 2. 다단계 플로우 테스트

```typescript
it('nextStep으로 다음 단계로 이동할 수 있다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
        result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
    });
    act(() => {
        result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
});

it('현재 단계가 유효하지 않으면 nextStep이 동작하지 않는다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    // 이름을 입력하지 않은 상태에서 nextStep 시도
    act(() => {
        result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(0); // 그대로 0
});
```

**학습 포인트**
- 조건부 상태 전환 테스트
- 검증 실패 시 상태 변경 방지 확인

### 3. 동적 인덱스 관리

```typescript
it('Step 2 (펫 상세 정보)에서 여러 펫을 순회할 수 있다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    // Setup - Step 2까지 이동하고 펫 2마리 설정
    act(() => {
        result.current.owner.setOwnerInfo({ name: '김철수', photo: '' });
    });
    act(() => {
        result.current.nextStep(); // Step 1
    });
    act(() => {
        result.current.petCount.setPetCount({ dogs: 2, cats: 0 });
    });
    act(() => {
        result.current.nextStep(); // Step 2
    });

    const mockPets: PetInfoData[] = [
        { id: '1', name: '멍멍이', ... },
        { id: '2', name: '뽀삐', ... },
    ];

    act(() => {
        result.current.petDetails.setPets(mockPets);
    });

    // 첫 번째 펫에서 nextStep (두 번째 펫으로 이동)
    expect(result.current.currentPetIndex).toBe(0);
    act(() => {
        result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2); // 여전히 Step 2
    expect(result.current.currentPetIndex).toBe(1); // 두 번째 펫
});
```

**학습 포인트**
- 동적 인덱스 관리 테스트
- 같은 Step 내에서 서브 인덱스 이동
- 복잡한 플로우 로직 검증

### 4. 경계 조건 테스트

```typescript
it('Step 0에서 prevStep을 호출하면 그대로 유지된다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
        result.current.prevStep();
    });

    expect(result.current.currentStep).toBe(0);
});

it('마지막 Step에서 nextStep을 호출하면 그대로 유지된다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    // ... Step 4까지 이동 ...

    expect(result.current.currentStep).toBe(4);

    act(() => {
        result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(4); // 그대로 유지
});
```

**학습 포인트**
- 경계 조건 (첫 Step, 마지막 Step) 테스트
- 의도하지 않은 상태 변경 방지 확인

---

# 🎓 핵심 API 정리

| API | 용도 | 예시 |
| --- | --- | --- |
| `renderHook()` | 훅 렌더링 | `renderHook(() => useMyHook())` |
| `result.current` | 훅의 현재 반환값 | `result.current.value` |
| `act()` | 동기 상태 업데이트 | `act(() => setValue('x'))` |
| `await act(async)` | 비동기 상태 업데이트 | `await act(async () => await fn())` |
| `waitFor()` | 비동기 조건 대기 | `await waitFor(() => expect(...))` |
| `vi.mock()` | 모듈 모킹 | `vi.mock('@/lib/api')` |
| `vi.fn()` | 목 함수 생성 | `const mockFn = vi.fn()` |
| `mockResolvedValue()` | Promise 모킹 | `fn.mockResolvedValue({ data })` |
| `vi.clearAllMocks()` | 모킹 초기화 | `beforeEach(() => vi.clearAllMocks())` |

---

# 🚀 스터디 발제 주제

## 1. renderHook과 act의 역할

**주제**: "훅 테스트의 핵심 도구, renderHook과 act는 무엇이 다를까?"

### renderHook vs act 비교

| 구분 | renderHook | act |
| --- | --- | --- |
| **역할** | 훅을 테스트 환경에서 실행 | 상태 변경을 안전하게 처리 |
| **사용 시점** | 훅을 처음 렌더링할 때 | 상태를 변경하는 함수 호출할 때 |
| **반환값** | `result.current` (훅의 반환값) | 없음 (래퍼 함수) |
| **필수 여부** | 항상 필요 | 상태 변경 시에만 필요 |

**코드 예시**:
```typescript
// renderHook: 훅을 테스트 환경에 마운트
const { result } = renderHook(() => usePetCount());

// 상태 읽기만 할 때는 act() 불필요
expect(result.current.petCount).toEqual({ dogs: 0, cats: 1 });

// 상태 변경할 때는 act() 필수
act(() => {
    result.current.setPetCount({ dogs: 2, cats: 1 });
});
```

**핵심 내용**:
- **renderHook**: 컴포넌트 없이 훅만 독립적으로 테스트
- **act()**: React의 상태 업데이트 배치(batch)가 완료될 때까지 대기
- act() 없이 상태 변경하면 "Warning: An update to TestComponent inside a test was not wrapped in act(...)" 경고 발생

**언제 act()를 사용할까?**
- ✅ 상태를 변경하는 함수 호출 시 (`setState`, `handleChange` 등)
- ✅ 비동기 작업 수행 시 (`await act(async () => ...)`)
- ❌ 단순히 값을 읽을 때는 불필요

**토론 질문**:
- act()를 빼먹었을 때 어떤 문제가 발생했나요?
- renderHook 없이 훅을 직접 호출하면 왜 안 될까요?

---

## 2. API 모킹의 필요성

**주제**: "실제 API를 호출하지 않고 테스트하는 방법"

**핵심 내용**:
- 왜 테스트에서 실제 API를 호출하면 안 될까?
  - 느림, 비용, 외부 의존성, 불안정성
- vi.mock()으로 외부 의존성 제거
- 다양한 응답 시나리오 테스트

**코드 예시**:
```typescript
// 성공 시나리오
vi.mocked(api).mockResolvedValue({ data: success });

// 실패 시나리오
vi.mocked(api).mockResolvedValue({ error: 'Failed' });
```

### vi.mock() vs MSW: 우리는 왜 vi.mock()을 선택했을까?

**Phase 2에서 사용한 방법**:
```typescript
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: { signInWithPassword: vi.fn() }
    }
}));
```

**비교표**:

| 구분 | vi.mock() | MSW |
| --- | --- | --- |
| 모킹 레벨 | 모듈 함수 직접 교체 | HTTP 요청 인터셉트 |
| 사용 목적 | 단위 테스트 (훅 내부 로직) | 통합 테스트 (실제 요청 흐름) |
| 속도 | 매우 빠름 | 빠름 |
| 설정 난이도 | 쉬움 | 중간 (핸들러 필요) |
| 실제 환경 유사도 | 낮음 | 높음 |

**Phase 2에서 vi.mock()을 선택한 이유**:
- 훅의 **내부 상태 변화**를 테스트하는 게 목적
- 실제 HTTP 요청 구조는 중요하지 않음
- 빠르고 간단하게 여러 시나리오 테스트 가능

**MSW는 언제 사용?**
- Phase 3 (컴포넌트 테스트)에서 고려
- 렌더링 → API 호출 → UI 업데이트 전체 흐름을 테스트할 때

---

## 3. 테스트로 발견한 버그

**주제**: "공백 처리 버그를 테스트가 찾아냈다"

**핵심 내용**:
- 테스트 작성 → 실패 → 버그 발견 → 코드 수정
- Zod 스키마에 trim() 추가
- 테스트 주도 개발(TDD)의 가치

**실제 사례**:
```typescript
// 테스트: "   " 입력은 유효하지 않아야 함
// 결과: 테스트 실패 (실제로는 통과함)
// 해결: 스키마에 .trim() 추가
```

---

## 4. 복잡한 비동기 플로우 테스트

**주제**: "2단계 비동기 호출은 어떻게 테스트할까?"

**핵심 내용**:
- useSignupForm의 연쇄 API 호출 (signUp → signInWithPassword)
- 중간 단계 실패 시나리오 테스트의 중요성
- mockResolvedValue vs mockRejectedValue 활용

**코드 예시**:
```typescript
// 첫 번째 API는 성공, 두 번째 API는 실패
vi.mocked(supabase.auth.signUp).mockResolvedValue({ ... });
vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
    new Error('Auto login failed')
);

// 중간 단계 실패 콜백 검증
expect(onAutoLoginFailure).toHaveBeenCalled();
```

**토론 질문**:
- 실제 프로젝트에서 2단계 이상의 비동기 호출이 있는 경우는?
- 중간 단계 실패를 어떻게 처리해야 사용자 경험이 좋을까?

---

# 📚 다음 단계

### Phase 3 예정: 컴포넌트 테스트
- UI 렌더링 테스트
- 사용자 이벤트 시뮬레이션
- Props 검증

---

# ✅ 완료된 작업

1. ✅ @testing-library/react 설치
2. ✅ vitest.config.ts에 happy-dom 환경 추가
3. ✅ `usePetCount` 훅 9개 테스트 (간단한 상태 관리)
4. ✅ `useOwnerInfo` 훅 9개 테스트 (Zod 검증)
5. ✅ `useLoginForm` 훅 10개 테스트 (API 모킹)
6. ✅ `useSignupForm` 훅 13개 테스트 (2단계 비동기 호출)
7. ✅ `useModeSelection` 훅 5개 테스트 (Enum 검증)
8. ✅ `usePetDetails` 훅 9개 테스트 (배열 상태 관리)
9. ✅ `useOnboardingFlow` 훅 14개 테스트 (복합 훅)
10. ✅ Zod 스키마 버그 수정 (trim 추가)
11. ✅ `useSignupForm` isFormValid 타입 버그 수정 (boolean 강제)
12. ✅ 개발용 임시 데이터 제거 (useOwnerInfo, usePetCount)
13. ✅ 총 87개 테스트 모두 통과

---

# 📂 테스트 파일 구조

```
src/features/
├── onBoarding/hooks/
│   ├── __tests__/
│   │   ├── usePetCount.test.ts           (9 tests)
│   │   ├── useOwnerInfo.test.ts          (9 tests)
│   │   ├── useModeSelection.test.ts      (5 tests)
│   │   ├── usePetDetails.test.ts         (9 tests)
│   │   └── useOnboardingFlow.test.ts     (14 tests)
│   ├── usePetCount.ts
│   ├── useOwnerInfo.ts
│   ├── useModeSelection.ts
│   ├── usePetDetails.ts
│   └── useOnboardingFlow.ts
└── auth/hooks/
    ├── __tests__/
    │   ├── useLoginForm.test.ts          (10 tests)
    │   └── useSignupForm.test.ts         (13 tests)
    ├── useLoginForm.ts
    └── useSignupForm.ts
```

---

**작성일**: 2025-11-12
**Phase**: 2 - 커스텀 훅 테스트
**다음 Phase**: 3 - 컴포넌트 테스트 (예정)
