import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const CalendarHeader = ({
    currentMonth,
    currentYear,
    onMonthChange,
    onYearChange,
}: {
    currentMonth: number;
    currentYear: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
}) => {
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    const [showSelector, setShowSelector] = useState(false);
    const [tempYear, setTempYear] = useState(currentYear);

    return (
        <header className="flex items-center justify-between bg-white relative flex-1">
            {/* Left: Year/Month selector */}
            <div className="relative">
                <motion.button
                    className="flex items-center space-x-1 rounded-full border-2 border-gray-200"
                    onClick={() => {
                        setTempYear(currentYear);
                        setShowSelector(!showSelector);
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="text-lg font-bold text-gray-800">
                        {currentYear}년 {months[currentMonth]}
                    </span>
                    <ChevronDown size={16} color="#C4C4C4" />
                </motion.button>

                {/* 월/연도 선택 드롭다운 */}
                <AnimatePresence>
                    {showSelector && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-8 left-0 p-3 bg-white rounded-xl shadow-lg border border-gray-100 z-50 w-64"
                        >
                            {/* 연도 변경 */}
                            <div className="flex items-center justify-between mb-4">
                                <motion.button
                                    onClick={() => setTempYear(prev => prev - 1)}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <ChevronLeft size={18} />
                                </motion.button>
                                <span className="text-lg font-semibold">{tempYear}년</span>
                                <motion.button
                                    onClick={() => setTempYear(prev => prev + 1)}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>

                            {/* 월 선택 */}
                            <div className="grid grid-cols-4 gap-2">
                                {months.map((label, idx) => {
                                    const isSelected =
                                        tempYear === currentYear && idx === currentMonth;
                                    return (
                                        <motion.button
                                            key={label}
                                            onClick={() => {
                                                onYearChange(tempYear);
                                                onMonthChange(idx);
                                                setShowSelector(false);
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
                                        >
                                            {label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right: Notification */}
            <div className="relative">
                <motion.button
                    className="p-2 rounded-full hover:bg-gray-50"
                    whileTap={{ scale: 0.9 }}
                >
                    <Bell size={20} color="#5F5F5F" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
                </motion.button>
            </div>

            {/* 바깥 클릭 시 닫힘 */}
            {showSelector && (
                <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />
            )}
        </header>
    );
};

export default CalendarHeader;
