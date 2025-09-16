import { eventIconMap } from '@/features/main/home/lib/icons';
import type { EventItem } from '@/features/main/home/types/event';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

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

    const daysInView = useMemo(() => {
        const days: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
        const today = new Date();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            days.push({ day: prevLastDay - i, isCurrentMonth: false, isToday: false });
        }

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

        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false, isToday: false });
        }

        return days;
    }, [currentYear, currentMonth]);

    const dateToEventsMap = useMemo(() => {
        const map = new Map<string, EventItem[]>();
        for (const ev of events) {
            if (!map.has(ev.date)) map.set(ev.date, []);
            map.get(ev.date)!.push(ev);
        }
        return map;
    }, [events]);

    return (
        <div className="px-6 py-4 flex-1 flex flex-col">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map((day, index) => (
                    <div
                        key={day}
                        className={`text-center text-sm font-medium py-2 ${
                            index === 0
                                ? 'text-red-500'
                                : index === 6
                                  ? 'text-blue-500'
                                  : 'text-gray-500'
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 날짜 grid */}
            <div className="grid grid-cols-7 gap-1 flex-1">
                {daysInView.map((dayInfo, idx) => {
                    const dayOfWeek = dayInfo.isCurrentMonth
                        ? new Date(currentYear, currentMonth, dayInfo.day).getDay()
                        : -1;
                    const dateColorClass = dayInfo.isCurrentMonth
                        ? dayOfWeek === 0
                            ? 'text-primary'
                            : dayOfWeek === 6
                              ? 'text-blue-500'
                              : 'text-gray-800'
                        : 'text-gray-300';
                    const todayMid = new Date();
                    todayMid.setHours(0, 0, 0, 0);
                    const cellDate = new Date(currentYear, currentMonth, dayInfo.day);
                    const isFuture =
                        dayInfo.isCurrentMonth && cellDate.getTime() > todayMid.getTime();
                    const dayKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayInfo.day).padStart(2, '0')}`;
                    const dayEvents = dayInfo.isCurrentMonth
                        ? (dateToEventsMap.get(dayKey) ?? [])
                        : [];
                    const isSelected = selectedDate === dayInfo.day && dayInfo.isCurrentMonth;

                    const isInteractive = dayInfo.isCurrentMonth && !isFuture;
                    return (
                        <motion.button
                            key={`${dayInfo.isCurrentMonth ? 'current' : 'other'}-${dayInfo.day}-${idx}`}
                            className={`
    w-full h-full flex flex-col items-center justify-start rounded-lg
    ${dayInfo.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
    ${dayInfo.isToday ? 'bg-gray-100' : isSelected ? 'bg-blue-50 border-2 border-blue-200' : isInteractive ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
    transition-colors duration-200
  `}
                            style={{ aspectRatio: '1 / 1' }}
                            disabled={!isInteractive}
                            whileTap={isInteractive ? { scale: 0.95 } : undefined}
                            onClick={() => isInteractive && onDateSelect(dayInfo.day)}
                        >
                            {/* 날짜 */}
                            <div
                                className={`mt-1 text-sm font-medium ${dateColorClass} ${isFuture ? 'opacity-40' : ''}`}
                            >
                                {dayInfo.day}
                            </div>

                            {/* 아이콘 영역 */}
                            <div
                                className={`grid grid-cols-2 gap-1 auto-rows-min justify-start items-start flex-1 overflow-hidden ${isFuture ? 'opacity-30' : ''}`}
                                style={{
                                    maxHeight: 'calc(100% - 20px)',
                                }}
                            >
                                {dayEvents.map(event => {
                                    const IconComponent = eventIconMap[event.category];
                                    return IconComponent ? (
                                        <div key={event.id} className="w-[12.5px] h-[12.5px]">
                                            <IconComponent className="w-[12.5px] h-[12.5px]" />
                                        </div>
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
