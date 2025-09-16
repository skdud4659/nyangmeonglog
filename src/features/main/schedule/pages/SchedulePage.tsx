import {
    createSchedule,
    deleteSchedule,
    listSchedules,
    markScheduleCompleted,
    updateSchedule,
    type ScheduleCategory,
    type ScheduleItem,
} from '@/features/main/schedule/api/schedulesApi';
import AddScheduleModal from '@/features/main/schedule/components/AddScheduleModal';
import CategoryTabs from '@/features/main/schedule/components/CategoryTabs';
import EditScheduleModal from '@/features/main/schedule/components/EditScheduleModal';
import HeroCard from '@/features/main/schedule/components/HeroCard';
import ScheduleRow from '@/features/main/schedule/components/ScheduleRow';
import SectionHeader from '@/features/main/schedule/components/SectionHeader';
import { formatDateKorean } from '@/features/main/schedule/lib/date';
import DentalBgIcon from '@/shared/assets/icons/dentalIcon.svg?react';
import InjectionBgIcon from '@/shared/assets/icons/injectionIcon.svg?react';
import PawPrintIcon from '@/shared/assets/icons/pawPrintIcon.svg?react';
import IconButton from '@/shared/components/atoms/IconButton';
import { useAuthStore } from '@/shared/store/authStore';
import { usePetStore } from '@/shared/store/petStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const SchedulePage = () => {
    const [category, setCategory] = useState<ScheduleCategory>('health');
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showAllCompleted, setShowAllCompleted] = useState(false);
    const user = useAuthStore(state => state.user);
    const { pets, activePetId } = usePetStore();
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // 데이터 로드
    useEffect(() => {
        const run = async () => {
            if (!user?.id) return;
            const list = await listSchedules({ userId: user.id, category });
            setSchedules(list);
        };
        run();
    }, [user?.id, category]);

    const { upcomingItems, completedItems, heroItem } = useMemo(() => {
        const listForCategory = schedules.filter(s => s.category === category);
        const upcoming = listForCategory
            .filter(s => !s.isCompleted)
            .sort((a, b) => a.date.localeCompare(b.date));
        const completed = listForCategory
            .filter(s => s.isCompleted)
            .sort((a, b) => b.date.localeCompare(a.date));
        return {
            upcomingItems: upcoming,
            completedItems: completed,
            heroItem: upcoming[0],
        };
    }, [schedules, category]);

    const editingItem = useMemo(
        () => schedules.find(s => s.id === editingId) || null,
        [schedules, editingId]
    );

    const handleComplete = async (id: string) => {
        try {
            await markScheduleCompleted(id, true);
            setSchedules(prev =>
                prev.map(it => (it.id === id ? { ...it, isCompleted: true } : it))
            );
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSchedule(id);
            setSchedules(prev => prev.filter(it => it.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const isEmpty = upcomingItems.length === 0 && completedItems.length === 0;

    return (
        <div className="pb-28">
            {/* top-right tabs */}
            <CategoryTabs active={category} onChange={setCategory} />

            {!isEmpty && heroItem && (
                <>
                    <div className="px-6 mt-2">
                        <p className="text-sm text-gray_7">임박한 일정</p>
                        <p className="text-lg font-semibold text-gray_9">
                            {formatDateKorean(heroItem.date)}
                        </p>
                    </div>
                    <HeroCard
                        item={heroItem}
                        petName={pets.find(p => p.id === heroItem.petId)?.name}
                        category={category}
                        onChangeClick={() => {
                            setEditingId(heroItem.id);
                            setOpenEdit(true);
                        }}
                        onCompleteClick={() => handleComplete(heroItem.id)}
                    />
                </>
            )}

            {isEmpty ? (
                <div className="px-6 mt-12">
                    <div
                        className="relative flex flex-col rounded-3xl bg-[#F6FAFF] p-1 text-center min-h-[171px]"
                        style={{ boxShadow: '0px 4px 6px 1px rgba(218, 218, 218, 0.25)' }}
                    >
                        <div className="absolute right-2 top-2 flex items-center justify-end opacity-30 mb-3">
                            {category === 'health' ? (
                                <InjectionBgIcon className="w-[159px] h-[159px]" />
                            ) : (
                                <DentalBgIcon className="w-[159px] h-[159px]" />
                            )}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <p className="text-body1-bold text-gray_8">아직 등록된 일정이 없어요</p>
                            <p className="text-label text-gray_5 mt-1">
                                오른쪽 하단의 추가하기 버튼으로 일정을 등록해보세요
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <SectionHeader title="다가올 일정" />
                    <div className="px-6 flex flex-col gap-[6px]">
                        {(showAllUpcoming ? upcomingItems.slice(1) : upcomingItems.slice(1, 4)).map(
                            item => {
                                const pet = pets.find(p => p.id === item.petId);
                                return (
                                    <ScheduleRow
                                        key={item.id}
                                        item={item}
                                        petName={pet?.name}
                                        petPhotoUrl={pet?.photoUrl ?? null}
                                        petSpecies={pet?.species}
                                        onEdit={id => {
                                            setEditingId(id);
                                            setOpenEdit(true);
                                        }}
                                        onDelete={handleDelete}
                                    />
                                );
                            }
                        )}
                        {upcomingItems.length > 4 && (
                            <div className="flex justify-center">
                                <IconButton
                                    onClick={() => setShowAllUpcoming(v => !v)}
                                    icon={
                                        <motion.div animate={{ rotate: showAllUpcoming ? 180 : 0 }}>
                                            <ChevronDown className="text-gray_5" />
                                        </motion.div>
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <SectionHeader title="완료한 일정" />
                    <div className="px-6 flex flex-col gap-3">
                        {(showAllCompleted ? completedItems : completedItems.slice(0, 3)).map(
                            item => {
                                const pet = pets.find(p => p.id === item.petId);
                                return (
                                    <ScheduleRow
                                        key={item.id}
                                        item={item}
                                        petName={pet?.name}
                                        petPhotoUrl={pet?.photoUrl ?? null}
                                        petSpecies={pet?.species}
                                        onEdit={id => {
                                            setEditingId(id);
                                            setOpenEdit(true);
                                        }}
                                        onDelete={handleDelete}
                                    />
                                );
                            }
                        )}
                        {completedItems.length > 3 && (
                            <div className="flex justify-center">
                                <IconButton
                                    onClick={() => setShowAllCompleted(v => !v)}
                                    icon={
                                        <motion.div
                                            animate={{ rotate: showAllCompleted ? 180 : 0 }}
                                        >
                                            <ChevronDown className="text-gray_5" />
                                        </motion.div>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            <AnimatePresence>
                <motion.button
                    className="absolute right-4 bottom-24 z-40 flex flex-col items-center gap-1 bg-[#F0F0F0] rounded-3xl px-3 py-[10px] shadow-lg border border-gray-100"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpenAdd(true)}
                >
                    <PawPrintIcon className="text-primary w-6 h-6" />
                    <span className="text-sm font-bold text-gray_6">추가하기</span>
                </motion.button>
            </AnimatePresence>

            <AddScheduleModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                defaultDate={heroItem?.date}
                petOptions={pets.map(p => ({ id: p.id, name: p.name, photoUrl: p.photoUrl }))}
                defaultPetId={activePetId}
                onSubmit={async form => {
                    if (!user?.id) return;
                    const newItem = await createSchedule({
                        userId: user.id,
                        petId: form.petId ?? null,
                        category,
                        title: form.title || (category === 'health' ? '건강 일정' : '케어 일정'),
                        date: form.date,
                        location: form.location || undefined,
                        notificationsEnabled: form.notificationsEnabled,
                        reminderMinutes: form.reminderMinutes,
                    });
                    setSchedules(prev => [...prev, newItem]);
                }}
            />

            <EditScheduleModal
                open={openEdit}
                onClose={() => {
                    setOpenEdit(false);
                    setEditingId(null);
                }}
                defaultValues={{
                    petId: editingItem?.petId ?? heroItem?.petId ?? activePetId ?? null,
                    title: editingItem?.title ?? heroItem?.title ?? '',
                    date:
                        editingItem?.date ??
                        heroItem?.date ??
                        new Date().toISOString().split('T')[0],
                    location: editingItem?.location ?? heroItem?.location ?? '',
                    notificationsEnabled:
                        editingItem?.notificationsEnabled ?? heroItem?.notificationsEnabled ?? true,
                    reminderMinutes:
                        editingItem?.reminderMinutes ?? heroItem?.reminderMinutes ?? 60,
                }}
                petOptions={pets.map(p => ({ id: p.id, name: p.name, photoUrl: p.photoUrl }))}
                onSubmit={async form => {
                    if (!editingId) return;
                    const updated = await updateSchedule(editingId, {
                        petId: form.petId ?? null,
                        title: form.title,
                        date: form.date,
                        location: form.location || undefined,
                        notificationsEnabled: form.notificationsEnabled,
                        reminderMinutes: form.reminderMinutes,
                    });
                    setSchedules(prev => prev.map(it => (it.id === updated.id ? updated : it)));
                }}
            />
        </div>
    );
};

export default SchedulePage;
