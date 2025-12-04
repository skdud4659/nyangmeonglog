import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import OnboardingPage from '../OnboardingPage';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => navigateMock,
}));

vi.mock('@/features/onBoarding/api/onboardingApi', () => ({
    insertPet: vi.fn().mockResolvedValue({}),
    finalizeOnboarding: vi.fn().mockResolvedValue({}),
}));

describe('OnboardingPage (통합 테스트)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('초기에는 집사 정보 입력 단계가 보이고 다음 버튼은 비활성화된다', () => {
        render(<OnboardingPage />);

        expect(
            screen.getByText(/집사님의\s+정보를 입력해주세요!/),
        ).toBeInTheDocument();

        const nextButton = screen.getByRole('button', { name: '다음페이지' });
        expect(nextButton).toBeDisabled();
    });

    it('이름을 입력하면 다음 버튼이 활성화되고, 클릭 시 펫 개수 단계로 이동한다', async () => {
        const user = userEvent.setup();
        render(<OnboardingPage />);

        const nameInput = screen.getByPlaceholderText('이름을 입력해주세요');
        const nextButton = screen.getByRole('button', { name: '다음페이지' });

        await user.type(nameInput, '김집사');
        expect(nextButton).toBeEnabled();

        await user.click(nextButton);

        expect(await screen.findByText(/몇마리 키우시나요/)).toBeInTheDocument();
    });
});



