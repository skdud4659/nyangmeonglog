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
import EditScheduleModal from '@/features/main/schedule/components/EditScheduleModal';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DentalBgIcon from '@/shared/assets/icons/dentalIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import InjectionBgIcon from '@/shared/assets/icons/injectionIcon.svg?react';
import PawPrintIcon from '@/shared/assets/icons/pawPrintIcon.svg?react';
import Button from '@/shared/components/atoms/Button';
import IconButton from '@/shared/components/atoms/IconButton';
import { useAuthStore } from '@/shared/store/authStore';
import { usePetStore } from '@/shared/store/petStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// 사용하지 않는 과거 헬퍼 제거

// 초기에는 빈 목록, Supabase에서 로드

const formatDateKorean = (isoDate: string) => {
    const d = new Date(isoDate);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}월 ${day}일`;
};

const getDday = (isoDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(isoDate);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - today.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return 'D-Day';
    if (days > 0) return `D-${days}`;
    return `D+${Math.abs(days)}`;
};

const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-6 mt-6 mb-3">
        <p className="text-sm text-gray_9">{title}</p>
    </div>
);

const ScheduleRow = ({
    item,
    petName,
    petPhotoUrl,
    petSpecies,
    onEdit,
    onDelete,
}: {
    item: ScheduleItem;
    petName?: string;
    petPhotoUrl?: string | null;
    petSpecies?: 'dog' | 'cat';
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const dday = getDday(item.date);
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const handleDown = (e: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDown);
        return () => document.removeEventListener('mousedown', handleDown);
    }, [open]);
    return (
        <div
            className="flex items-center justify-between bg-white rounded-2xl px-4 py-[6px] shadow-sm relative"
            style={{ boxShadow: '0px 1px 13px 0px rgba(202,202,202,0.25)' }}
        >
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray_7 bg-gray-100 rounded-full px-3 py-1">
                    {dday}
                </span>
                <div className="flex flex-col">
                    <span className="text-label text-gray_5">{formatDateKorean(item.date)}</span>
                    <span className="text-body2-bold text-gray_9">{item.title}</span>
                    {petName && (
                        <span className="text-xs text-gray_5 flex items-center gap-1 mt-0.5">
                            {petPhotoUrl ? (
                                <img
                                    src={petPhotoUrl}
                                    alt={petName}
                                    className="w-4 h-4 rounded-full object-cover border border-gray-200"
                                />
                            ) : petSpecies === 'dog' ? (
                                <DogIcon className="w-4 h-4 text-gray_5" />
                            ) : (
                                <CatIcon className="w-4 h-4 text-gray_5" />
                            )}
                            <span>{petName}</span>
                        </span>
                    )}
                </div>
            </div>
            <div ref={menuRef}>
                <IconButton
                    onClick={() => setOpen(o => !o)}
                    icon={<MoreVertical size={18} className="text-gray_5" />}
                />
                {open && (
                    <div className="absolute right-2 top-12 bg-white border rounded-xl shadow-lg z-10 min-w-[120px]">
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-body2"
                            onClick={() => {
                                setOpen(false);
                                onEdit(item.id);
                            }}
                        >
                            변경
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-error text-body2"
                            onClick={() => {
                                setOpen(false);
                                onDelete(item.id);
                            }}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryTabs = ({
    active,
    onChange,
}: {
    active: ScheduleCategory;
    onChange: (c: ScheduleCategory) => void;
}) => {
    return (
        <div className="px-6 pt-6 flex justify-end">
            <div className="flex gap-6 items-center">
                {(
                    [
                        { key: 'health', label: '건강' },
                        { key: 'care', label: '케어' },
                    ] as const
                ).map(tab => {
                    const isActive = active === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onChange(tab.key)}
                            className="flex items-center gap-1"
                        >
                            {isActive && <PawPrintIcon className="w-6 h-6 text-gray_9" />}
                            <span className={`text-h4 ${isActive ? 'text-gray_9' : 'text-gray_3'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const HeroCard = ({
    item,
    petName,
    category,
    onChangeClick,
    onCompleteClick,
}: {
    item: ScheduleItem;
    petName?: string;
    category: ScheduleCategory;
    onChangeClick: () => void;
    onCompleteClick: () => void;
}) => {
    const BgIcon = category === 'health' ? InjectionBgIcon : DentalBgIcon;
    const dday = getDday(item.date);
    return (
        <div className="px-6 mt-4">
            <div
                className="relative overflow-hidden rounded-3xl bg-[#F9FBFF]"
                style={{ boxShadow: '0px 2px 16px 0px rgba(202,202,202,0.35)' }}
            >
                <div className="absolute right-2 top-2 opacity-20">
                    <BgIcon className="w-36 h-36" />
                </div>
                <div className="pt-6 px-4 pb-3">
                    <span className="text-sm font-extrabold bg-[#E8F0FF] text-[#3A6FF8] rounded-full px-3 py-1">
                        {dday}
                    </span>
                    <div className="mt-3">
                        <p className="text-body1-bold text-gray_9">
                            {petName ? `${petName} - ${item.title}` : item.title}까지
                            <br />
                            <span className="text-[#3A6FF8]">{dday.replace('D-', '')}일 </span>
                            <span>남았어요</span>
                        </p>
                    </div>
                    {item.location && (
                        <div className="mt-3 text-label text-gray_6">접종병원: {item.location}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 py-2 mt-3 bg-white border border-[#F9F9F9] rounded-2xl font-bold text-xs">
                        <Button
                            label="일정변경"
                            variant="secondary"
                            onClick={onChangeClick}
                            className="text-[#2E57E7]"
                        />
                        <Button
                            label="완료했어요"
                            onClick={onCompleteClick}
                            variant="secondary"
                            className="text-[#EB4040]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

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
