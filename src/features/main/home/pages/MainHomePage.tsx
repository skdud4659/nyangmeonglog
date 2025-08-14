import { CalendarGrid } from '@/features/main/home/components/CalendarGrid';
import CalendarHeader from '@/features/main/home/components/CalendarHeader';
import SimpleRecordForm from '@/features/main/home/components/SimpleRecordForm';
import type { EventItem } from '@/features/main/home/types/event';
import type { SimpleRecord } from '@/features/main/home/types/record';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

const samplePets = [
    { id: 'pet1', name: '초코', type: 'dog', photo: '/images/dog1.jpg' },
    { id: 'pet2', name: '나비', type: 'cat', photo: '/images/cat1.jpg' },
    { id: 'pet3', name: '몽이', type: 'dog' },
];

const sampleEvents: EventItem[] = [
    { id: '1', date: '2025-08-01', category: 'feed', petId: 'pet1' },
    { id: '2', date: '2025-08-01', category: 'snack', petId: 'pet1' },
    { id: '3', date: '2025-08-01', category: 'water', petId: 'pet2' },
    { id: '4', date: '2025-08-05', category: 'poop', petId: 'pet1' },
    { id: '5', date: '2025-08-12', category: 'snack', petId: 'pet2' },
];

const sampleRecords: SimpleRecord[] = [
    {
        id: 'r1',
        date: '2025-08-01',
        petId: 'pet1',
        food: true,
        water: true,
        snack: false,
        poop: true,
        pee: false,
    },
];

const MainHomePage = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [records, setRecords] = useState<SimpleRecord[]>(sampleRecords);

    const [activePetId, setActivePetId] = useState(samplePets[0].id);
    const [showPetSelector, setShowPetSelector] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);

    const activePet = samplePets.find(pet => pet.id === activePetId);
    const filteredEvents = sampleEvents.filter(event => event.petId === activePetId);

    const selectedDateStr =
        selectedDate !== null
            ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
            : todayStr;

    const recordForDate = records.find(r => r.date === selectedDateStr && r.petId === activePetId);

    const handleSaveRecord = (record: SimpleRecord) => {
        setRecords(prev => {
            const exists = prev.find(r => r.date === record.date && r.petId === record.petId);
            if (exists) {
                return prev.map(r =>
                    r.date === record.date && r.petId === record.petId ? record : r
                );
            }
            return [...prev, record];
        });
    };

    return (
        <>
            {/* 헤더 */}
            <div className="flex items-center px-6 py-4 relative z-20">
                <button
                    className="w-10 h-10 rounded-full border mr-3"
                    onClick={() => setShowPetSelector(true)}
                >
                    {activePet?.photo ? (
                        <img
                            src={activePet.photo}
                            alt={activePet.name}
                            className="w-full h-full object-cover"
                        />
                    ) : activePet?.type === 'dog' ? (
                        <DogIcon className="w-full h-full text-gray_300" />
                    ) : (
                        <CatIcon className="w-full h-full text-gray_300" />
                    )}
                </button>
                <CalendarHeader
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onMonthChange={setCurrentMonth}
                    onYearChange={setCurrentYear}
                />
            </div>

            {/* 달력 */}
            <CalendarGrid
                currentMonth={currentMonth}
                currentYear={currentYear}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                events={filteredEvents}
            />

            {/* 추가/수정 버튼 (BottomNavigation 위) */}
            <div
                className="px-4 py-4 bg-white flex items-center justify-between border-t rounded-t-2xl border-gray-100"
                style={{
                    boxShadow: '0px -1px 19px 0px rgba(202, 202, 202, 0.25)',
                }}
            >
                <span className="text-base font-medium">
                    {`${currentMonth + 1}월 ${selectedDate ?? today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][new Date(currentYear, currentMonth, selectedDate ?? today.getDate()).getDay()]})`}
                </span>
                <button
                    className="text-red-400 text-sm font-medium"
                    onClick={() => setIsFormOpen(true)}
                >
                    {recordForDate ? '수정' : '추가'}
                </button>
            </div>

            {/* 펫 선택 오버레이 */}
            {showPetSelector && (
                <div
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50"
                    onClick={() => setShowPetSelector(false)}
                >
                    <div
                        className="flex flex-col items-center space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        {samplePets.map(pet => (
                            <button
                                key={pet.id}
                                className="w-20 h-20 rounded-full overflow-hidden bg-white"
                                onClick={() => {
                                    setActivePetId(pet.id);
                                    setShowPetSelector(false);
                                }}
                            >
                                {pet.photo ? (
                                    <img
                                        src={pet.photo}
                                        alt={pet.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : pet.type === 'dog' ? (
                                    <DogIcon className="w-full h-full p-4 text-gray-400" />
                                ) : (
                                    <CatIcon className="w-full h-full p-4 text-gray-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom sheet 폼 */}
            <AnimatePresence>
                {isFormOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 z-40 max-w-md mx-auto"
                            onClick={() => setIsFormOpen(false)}
                        />
                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-lg max-w-md mx-auto"
                            style={{ height: '95%' }}
                        >
                            <SimpleRecordForm
                                selectedDate={selectedDate ?? today.getDate()}
                                currentMonth={currentMonth}
                                onClose={() => setIsFormOpen(false)}
                                petId={activePetId}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default MainHomePage;
