import { getUserPets, type PetItem } from '@/features/main/home/api/petsApi';
import { getSimpleRecordsForMonth } from '@/features/main/home/api/recordsApi';
import { CalendarGrid } from '@/features/main/home/components/CalendarGrid';
import CalendarHeader from '@/features/main/home/components/CalendarHeader';
import SimpleRecordForm from '@/features/main/home/components/SimpleRecordForm';
import type { EventCategory, EventItem } from '@/features/main/home/types/event';
import type { SimpleRecord } from '@/features/main/home/types/record';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import { initPushForUser } from '@/shared/lib/push';
import { useAuthStore } from '@/shared/store/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const MainHomePage = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [records, setRecords] = useState<SimpleRecord[]>([]);

    const [pets, setPets] = useState<PetItem[]>([]);
    const [activePetId, setActivePetId] = useState<string | null>(null);
    const [showPetSelector, setShowPetSelector] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const activePet = pets.find(pet => pet.id === activePetId);
    const filteredEvents = useMemo<EventItem[]>(() => {
        const events: EventItem[] = [];
        const pushEvent = (
            enabled: boolean,
            category: EventCategory,
            date: string,
            petId: string
        ) => {
            if (enabled) events.push({ id: `${date}:${petId}:${category}`, date, category, petId });
        };

        records
            .filter(r => r.petId === activePetId)
            .forEach(r => {
                const hasFeed = !!r.food;
                const hasSnack = !!r.snack;
                const hasPoop = !!r.poop;
                const hasPee = !!r.pee;
                const hasWater = !!r.water;
                const hasExtras =
                    !!r.extras && (r.extras.brush || r.extras.bath || r.extras.grooming);
                const hasHealth =
                    !!r.health &&
                    (!!r.health.spasm?.note ||
                        !!r.health.spasm?.photoUrl ||
                        !!r.health.vaccination?.note ||
                        !!r.health.vaccination?.photoUrl ||
                        !!r.health.checkup?.note ||
                        !!r.health.checkup?.photoUrl);
                const hasSupplements = Array.isArray(r.supplements) && r.supplements.length > 0;

                // Order (row-major for 2-col grid):
                // [feed, snack], [poop, pee], [water, grooming], [medicine, checkup]
                pushEvent(hasFeed, 'feed', r.date, r.petId);
                pushEvent(hasSnack, 'snack', r.date, r.petId);
                pushEvent(hasPoop, 'poop', r.date, r.petId);
                pushEvent(hasPee, 'pee', r.date, r.petId);
                pushEvent(hasWater, 'water', r.date, r.petId);
                pushEvent(hasExtras, 'grooming', r.date, r.petId);
                pushEvent(hasSupplements, 'medicine', r.date, r.petId);
                pushEvent(hasHealth, 'checkup', r.date, r.petId);
            });

        return events;
    }, [records, activePetId]);

    const selectedDateStr =
        selectedDate !== null
            ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
            : todayStr;

    const recordForDate = records.find(r => r.date === selectedDateStr && r.petId === activePetId);

    const user = useAuthStore(state => state.user);

    const loadRecords = useMemo(
        () => async () => {
            if (!user?.id || !activePetId) return;
            const list = await getSimpleRecordsForMonth({
                userId: user.id,
                petId: activePetId,
                year: currentYear,
                month: currentMonth,
            });
            setRecords(list);
        },
        [user?.id, activePetId, currentYear, currentMonth]
    );

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    // 사용자 펫 목록 로드 및 활성 펫 설정
    useEffect(() => {
        const run = async () => {
            if (!user?.id) return;
            const list = await getUserPets(user.id);
            setPets(list);
            if (!activePetId && list.length > 0) {
                setActivePetId(list[0].id);
            }
            // Initialize push subscription for the user (non-blocking)
            initPushForUser(user.id);
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // 저장 콜백은 폼의 onSaved에서 직접 처리

    return (
        <>
            {/* 헤더 */}
            <div className="flex items-center px-6 py-4 relative z-20">
                <button
                    className="w-10 h-10 rounded-full border mr-3"
                    onClick={() => setShowPetSelector(true)}
                >
                    {activePet?.photo_url ? (
                        <img
                            src={activePet.photo_url}
                            alt={activePet.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : activePet?.species === 'dog' ? (
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
                {/* Bell icon */}
                {/* <button className="ml-auto relative" onClick={() => setShowNotifications(v => !v)}>
                    <Bell size={20} className="text-gray_6" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                </button> */}
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
                        {pets.map(pet => (
                            <button
                                key={pet.id}
                                className="w-20 h-20 rounded-full overflow-hidden bg-white"
                                onClick={() => {
                                    setActivePetId(pet.id);
                                    setShowPetSelector(false);
                                }}
                            >
                                {pet.photo_url ? (
                                    <img
                                        src={pet.photo_url}
                                        alt={pet.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : pet.species === 'dog' ? (
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
                            {activePetId && (
                                <SimpleRecordForm
                                    selectedDate={selectedDate ?? today.getDate()}
                                    currentMonth={currentMonth}
                                    currentYear={currentYear}
                                    onClose={() => setIsFormOpen(false)}
                                    petId={activePetId}
                                    initialRecord={recordForDate}
                                    onSaved={saved => {
                                        setRecords(prev => {
                                            const exists = prev.find(
                                                r =>
                                                    r.date === saved.date && r.petId === saved.petId
                                            );
                                            if (exists) {
                                                return prev.map(r =>
                                                    r.date === saved.date && r.petId === saved.petId
                                                        ? saved
                                                        : r
                                                );
                                            }
                                            return [...prev, saved];
                                        });
                                    }}
                                />
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Notifications Popover */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-4 top-16 z-50 bg-white rounded-xl shadow-lg border p-3 w-72"
                    >
                        <div className="text-body2-bold mb-2">알림</div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {/* TODO: 실제 알림 데이터로 대체 */}
                            <div className="text-sm text-gray_8">
                                공지: 새로운 기능이 추가되었습니다.
                            </div>
                            <div className="text-sm text-gray_8">일정: 내일 접종 1시간 전 알림</div>
                        </div>
                        <div className="mt-3 text-right">
                            <button
                                className="text-label text-gray_6"
                                onClick={() => setShowNotifications(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MainHomePage;
