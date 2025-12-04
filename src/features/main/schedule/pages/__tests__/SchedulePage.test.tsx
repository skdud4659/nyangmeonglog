import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SchedulePage from '../SchedulePage';

const listSchedulesMock = vi.fn();
const createScheduleMock = vi.fn();
const markScheduleCompletedMock = vi.fn();
const deleteScheduleMock = vi.fn();
const updateScheduleMock = vi.fn();

vi.mock('@/features/main/schedule/api/schedulesApi', () => ({
    listSchedules: (...args: unknown[]) => listSchedulesMock(...args),
    createSchedule: (...args: unknown[]) => createScheduleMock(...args),
    markScheduleCompleted: (...args: unknown[]) => markScheduleCompletedMock(...args),
    deleteSchedule: (...args: unknown[]) => deleteScheduleMock(...args),
    updateSchedule: (...args: unknown[]) => updateScheduleMock(...args),
}));

vi.mock('@/shared/store/authStore', () => ({
    useAuthStore:
        (selector: (state: { user: { id: string; email: string } | null }) => unknown) =>
            selector({ user: { id: 'user-123', email: 'user@test.com' } }),
}));

const mockPets = [
    { id: 'pet-1', name: '멍멍이', photoUrl: null, species: 'dog' },
    { id: 'pet-2', name: '야옹이', photoUrl: null, species: 'cat' },
] as const;

vi.mock('@/shared/store/petStore', () => ({
    usePetStore: () => ({
        pets: mockPets,
        activePetId: 'pet-1',
    }),
}));

describe('SchedulePage (통합 테스트)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listSchedulesMock.mockResolvedValue([]);
        createScheduleMock.mockResolvedValue({
            id: 'schedule-1',
            petId: 'pet-1',
            category: 'health',
            title: '병원 예약',
            date: '2025-01-15',
            location: '우리동물병원',
            isCompleted: false,
            notificationsEnabled: true,
            reminderMinutes: 60,
        });
    });

    it('초기 렌더링 시 현재 사용자와 카테고리로 일정을 조회한다', async () => {
        render(<SchedulePage />);

        await waitFor(() => {
            expect(listSchedulesMock).toHaveBeenCalledWith({
                userId: 'user-123',
                category: 'health',
            });
        });
    });

    it('추가하기 버튼을 눌러 모달을 연 뒤 일정을 등록하면 화면에 새 일정이 표시된다', async () => {
        const user = userEvent.setup();
        render(<SchedulePage />);

        const addButton = await screen.findByRole('button', { name: '추가하기' });
        await user.click(addButton);

        // 모달 내에서 제목과 장소를 입력
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

        // HeroCard에서 "멍멍이 - 병원 예약까지"로 표시됨
        expect(await screen.findByText(/병원 예약/)).toBeInTheDocument();
    });
});



