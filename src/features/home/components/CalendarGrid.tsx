import { eventIconMap } from '@/features/home/composables/icons';
import type { EventItem } from '@/features/home/types/event';
import { motion } from 'framer-motion';

interface CalendarGridProps {
    currentMonth: number;
    currentYear: number;
    selectedDate: number | null;
    onDateSelect: (date: number) => void;
    events: EventItem[];
}

export const CalendarGrid = ({
    currentMonth,
    currentYear,
    selectedDate,
    onDateSelect,
    events,
}: CalendarGridProps) => {
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    const getDaysInMonth = () => {
        const days: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
        const today = new Date();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        // 이전 달 채우기
        const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            days.push({ day: prevLastDay - i, isCurrentMonth: false, isToday: false });
        }

        // 이번 달
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                isToday:
                    i === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear(),
            });
        }

        // 다음 달 채우기
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false, isToday: false });
        }

        return days;
    };

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
            day
        ).padStart(2, '0')}`;
        return events.filter(event => event.date === dateStr);
    };

    return (
        <div className="px-6 py-4 flex-1 flex flex-col">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map((day, index) => (
                    <div
                        key={day}
                        className={`text-center text-sm font-medium py-2 ${
                            index === 0 || index === 6 ? 'text-blue-500' : 'text-gray-500'
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 날짜 grid */}
            <div className="grid grid-cols-7 gap-1 flex-1">
                {getDaysInMonth().map((dayInfo, idx) => {
                    const dayEvents = dayInfo.isCurrentMonth ? getEventsForDate(dayInfo.day) : [];
                    const isSelected = selectedDate === dayInfo.day && dayInfo.isCurrentMonth;

                    return (
                        <motion.button
                            key={`${dayInfo.isCurrentMonth ? 'current' : 'other'}-${dayInfo.day}-${idx}`}
                            className={`
    w-full h-full flex flex-col items-center justify-start rounded-lg
    ${dayInfo.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
    ${dayInfo.isToday ? 'bg-gray-100' : isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'}
    transition-colors duration-200
  `}
                            style={{ aspectRatio: '1 / 1' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => dayInfo.isCurrentMonth && onDateSelect(dayInfo.day)}
                        >
                            {/* 날짜 */}
                            <div className="mt-1 text-sm font-medium">{dayInfo.day}</div>

                            {/* 아이콘 영역 */}
                            <div
                                className="grid grid-cols-2 gap-1 flex-1 overflow-hidden"
                                style={{
                                    maxHeight: 'calc(100% - 20px)',
                                }}
                            >
                                {dayEvents.map(event => {
                                    const IconComponent = eventIconMap[event.category];
                                    return IconComponent ? (
                                        <IconComponent
                                            key={event.id}
                                            className="w-3 h-3 flex-shrink-0"
                                        />
                                    ) : null;
                                })}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
