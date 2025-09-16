import { getSimpleRecordsForMonth } from '@/features/main/home/api/recordsApi';
import { CalendarGrid } from '@/features/main/home/components/CalendarGrid';
import CalendarHeader from '@/features/main/home/components/CalendarHeader';
import DetailedRecordForm from '@/features/main/home/components/DetailedRecordForm';
import PetSelectorOverlay from '@/features/main/home/components/PetSelectorOverlay';
import RecordFormSheet from '@/features/main/home/components/RecordFormSheet';
import SimpleRecordForm from '@/features/main/home/components/SimpleRecordForm';
import type { EventCategory, EventItem } from '@/features/main/home/types/event';
import type { SimpleRecord } from '@/features/main/home/types/record';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import { initPushForUser } from '@/shared/lib/push';
import { useAuthStore } from '@/shared/store/authStore';
import { usePetStore } from '@/shared/store/petStore';
import { useSettingsStore } from '@/shared/store/settingsStore';
import { useEffect, useMemo, useState } from 'react';

const MainHomePage = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [records, setRecords] = useState<SimpleRecord[]>([]);

    const pets = usePetStore(state => state.pets);
    const activePetId = usePetStore(state => state.activePetId);
    const setActivePetId = usePetStore(state => state.setActivePetId);
    const loadPetsForCurrentUser = usePetStore(state => state.loadPetsForCurrentUser);
    const [showPetSelector, setShowPetSelector] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const appMode = useSettingsStore(s => s.mode);
    const syncModeFromProfile = useSettingsStore(s => s.syncModeFromProfile);

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
                const hasSupplements = Array.isArray(r.supplements)
                    ? r.supplements.length > 0
                    : false;

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

    const handleRecordSaved = (saved: SimpleRecord) => {
        setRecords(prev => {
            const exists = prev.find(r => r.date === saved.date && r.petId === saved.petId);
            if (exists) {
                return prev.map(r =>
                    r.date === saved.date && r.petId === saved.petId ? saved : r
                );
            }
            return [...prev, saved];
        });
    };

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
        if (!user?.id) return;
        loadPetsForCurrentUser();
        // Initialize push subscription for the user (non-blocking)
        initPushForUser(user.id);
        // sync mode from profile on login
        syncModeFromProfile();
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
                    {activePet?.photoUrl ? (
                        <img
                            src={activePet.photoUrl}
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

            <PetSelectorOverlay
                isOpen={showPetSelector}
                pets={pets}
                onClose={() => setShowPetSelector(false)}
                onSelect={petId => {
                    setActivePetId(petId);
                    setShowPetSelector(false);
                }}
            />

            <RecordFormSheet isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
                {activePetId &&
                    (appMode === 'detail' ? (
                        <DetailedRecordForm
                            selectedDate={selectedDate ?? today.getDate()}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            onClose={() => setIsFormOpen(false)}
                            petId={activePetId}
                            initialRecord={recordForDate}
                            onSaved={handleRecordSaved}
                        />
                    ) : (
                        <SimpleRecordForm
                            selectedDate={selectedDate ?? today.getDate()}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            onClose={() => setIsFormOpen(false)}
                            petId={activePetId}
                            initialRecord={recordForDate}
                            onSaved={handleRecordSaved}
                        />
                    ))}
            </RecordFormSheet>
        </>
    );
};

export default MainHomePage;
