import { getPetById, updatePet } from '@/features/main/home/api/petsApi';
import { upsertSimpleRecord } from '@/features/main/home/api/recordsApi';
import { eventIconMap } from '@/features/main/home/composables/iconsMap';
import type { SimpleRecord } from '@/features/main/home/types/record';
import AddPhotoIcon from '@/shared/assets/icons/addPhotoIcon.svg?react';
import SheetHeader from '@/shared/components/molecules/SheetHeader';
import { useAuthStore } from '@/shared/store/authStore';
import { useEffect, useMemo, useState } from 'react';

// 펫 선택은 부모(MainHomePage)에서 처리하므로 여기선 리스트를 렌더링만 유지

const activityList = [
    { key: 'feed', label: '사료', icon: eventIconMap['feed'] },
    { key: 'water', label: '물', icon: eventIconMap['water'] },
    { key: 'snack', label: '간식', icon: eventIconMap['snack'] },
    { key: 'poop', label: '대변', icon: eventIconMap['poop'] },
    { key: 'pee', label: '소변', icon: eventIconMap['pee'] },
];

const extraList = [
    { key: 'brush', label: '양치', icon: eventIconMap['brush'] },
    { key: 'bath', label: '목욕', icon: eventIconMap['bath'] },
    { key: 'grooming', label: '미용', icon: eventIconMap['grooming'] },
];

const healthList = [
    { key: 'spasm', label: '구충', icon: eventIconMap['spasm'] },
    { key: 'vaccination', label: '접종', icon: eventIconMap['vaccination'] },
    { key: 'checkup', label: '건강검진', icon: eventIconMap['checkup'] },
];

interface RecordFormProps {
    selectedDate: number;
    currentMonth: number;
    currentYear: number;
    petId: string;
    onClose: () => void;
    initialRecord?: SimpleRecord | null;
    onSaved?: (record: SimpleRecord) => void;
}

const RecordForm = ({
    selectedDate,
    currentMonth,
    currentYear,
    petId,
    onClose,
    initialRecord,
    onSaved,
}: RecordFormProps) => {
    const user = useAuthStore(state => state.user);

    const dateStr = useMemo(() => {
        return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    }, [currentYear, currentMonth, selectedDate]);

    const [food, setFood] = useState<boolean>(initialRecord?.food ?? false);
    const [water, setWater] = useState<boolean>(initialRecord?.water ?? false);
    const [snack, setSnack] = useState<boolean>(initialRecord?.snack ?? false);
    const [poop, setPoop] = useState<boolean>(initialRecord?.poop ?? false);
    const [pee, setPee] = useState<boolean>(initialRecord?.pee ?? false);

    const [supplements, setSupplements] = useState<string[]>([]);
    const [selectedSupplementNames, setSelectedSupplementNames] = useState<Set<string>>(new Set());
    const [newSupplementName, setNewSupplementName] = useState<string>('');
    const [extraSelected, setExtraSelected] = useState<Record<string, boolean>>({
        brush: initialRecord?.extras?.brush ?? false,
        bath: initialRecord?.extras?.bath ?? false,
        grooming: initialRecord?.extras?.grooming ?? false,
    });
    const [healthNotes, setHealthNotes] = useState<Record<string, string>>({
        spasm: '',
        vaccination: '',
        checkup: '',
    });

    useEffect(() => {
        setFood(initialRecord?.food ?? false);
        setWater(initialRecord?.water ?? false);
        setSnack(initialRecord?.snack ?? false);
        setPoop(initialRecord?.poop ?? false);
        setPee(initialRecord?.pee ?? false);
    }, [
        initialRecord?.id,
        initialRecord?.food,
        initialRecord?.water,
        initialRecord?.snack,
        initialRecord?.poop,
        initialRecord?.pee,
    ]);

    // 활성 펫 영양제 목록 서버 동기화 및 수정모드 초기값 적용
    useEffect(() => {
        let cancelled = false;
        const sync = async () => {
            try {
                const pet = await getPetById(petId);
                const list = pet?.supplements ?? [];
                if (!cancelled) {
                    setSupplements(list);
                    setSelectedSupplementNames(prev => {
                        if (prev.size > 0) return prev;
                        const used = initialRecord?.supplements ?? [];
                        return used.length > 0 ? new Set(used) : new Set();
                    });
                }
            } catch {
                // ignore
            }
        };
        sync();
        return () => {
            cancelled = true;
        };
    }, [petId, initialRecord?.supplements]);

    const toggleSupplement = (name: string) => {
        setSelectedSupplementNames(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const handleAddSupplement = async () => {
        const name = newSupplementName.trim();
        if (name.length === 0) return;
        setSupplements(prev => {
            const next = prev.includes(name) ? prev : [...prev, name];
            updatePet(petId, { supplements: next }).catch(() => {});
            return next;
        });
        setSelectedSupplementNames(prev => new Set([...Array.from(prev), name]));
        setNewSupplementName('');
    };

    const handleSave = async () => {
        if (!user?.id) {
            onClose();
            return;
        }
        const saved = await upsertSimpleRecord({
            userId: user.id,
            petId,
            date: dateStr,
            food,
            water,
            snack,
            poop,
            pee,
            // supplements removed: now managed on pet profile
            extras: {
                brush: !!extraSelected.brush,
                bath: !!extraSelected.bath,
                grooming: !!extraSelected.grooming,
            },
            health: {
                spasm: { note: healthNotes.spasm || undefined },
                vaccination: { note: healthNotes.vaccination || undefined },
                checkup: { note: healthNotes.checkup || undefined },
            },
        });
        onSaved?.(saved);
        onClose();
    };

    return (
        <div className="flex flex-col h-full">
            <SheetHeader
                title={`${currentMonth + 1}월 ${selectedDate}일`}
                onClose={onClose}
                onPrimary={handleSave}
                primaryLabel="저장"
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Pet Selector */}
                {/* 실제 펫 선택은 상위 화면에서 처리됩니다. */}

                {/* 오늘 {petName}? */}
                <div>
                    <div className="flex space-x-4">
                        {activityList.map(act => {
                            const selected =
                                (act.key === 'feed' && food) ||
                                (act.key === 'water' && water) ||
                                (act.key === 'snack' && snack) ||
                                (act.key === 'poop' && poop) ||
                                (act.key === 'pee' && pee);
                            const onToggle = () => {
                                if (act.key === 'feed') setFood(v => !v);
                                if (act.key === 'water') setWater(v => !v);
                                if (act.key === 'snack') setSnack(v => !v);
                                if (act.key === 'poop') setPoop(v => !v);
                                if (act.key === 'pee') setPee(v => !v);
                            };
                            return (
                                <div key={act.key} className="flex flex-col items-center gap-2">
                                    <button
                                        className={`w-16 h-16 items-center justify-center rounded-full flex flex-col text-sm ${selected ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-100 text-gray-500'}`}
                                        onClick={onToggle}
                                    >
                                        <act.icon className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-500">{act.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 영양제 */}
                <div>
                    <p className="mb-3 font-medium">영양제</p>
                    <div className="flex gap-2 mb-3">
                        <input
                            value={newSupplementName}
                            onChange={e => setNewSupplementName(e.target.value)}
                            placeholder="영양제 이름을 입력하세요"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                            className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700"
                            onClick={handleAddSupplement}
                        >
                            추가
                        </button>
                    </div>
                    <div className="space-y-3">
                        {supplements.length === 0 ? (
                            <div className="text-sm text-gray-400">
                                등록된 영양제가 없습니다. 위 입력란에서 추가해보세요.
                            </div>
                        ) : (
                            supplements.map(name => {
                                const selected = selectedSupplementNames.has(name);
                                return (
                                    <div key={name} className="flex items-center gap-2">
                                        <div
                                            className={`relative w-6 h-6 rounded-full bg-white border-2 cursor-pointer ${selected ? 'border-primary' : 'border-gray_2'}`}
                                            onClick={() => toggleSupplement(name)}
                                        >
                                            {selected && (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-700">{name}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 이것도 하셨다면 체크 */}
                <div>
                    <p className="mb-3 font-medium">이것도 하셨다면 체크!</p>
                    <div className="flex space-x-4">
                        {extraList.map(act => {
                            const isOn = Boolean(extraSelected[act.key]);
                            const toggle = () =>
                                setExtraSelected(prev => ({ ...prev, [act.key]: !prev[act.key] }));
                            return (
                                <div key={act.key} className="flex flex-col items-center gap-2">
                                    <button
                                        className={`w-16 h-16 items-center justify-center rounded-full flex flex-col text-sm ${
                                            isOn
                                                ? 'bg-red-50 text-red-500 border border-red-200'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                        onClick={toggle}
                                    >
                                        <act.icon className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-500">{act.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 건강 상태 체크 */}
                <div>
                    <p className="mb-3 font-medium">건강 상태 체크하기</p>
                    <div className="space-y-3">
                        {healthList.map(health => {
                            const noteValue =
                                healthNotes[health.key as keyof typeof healthNotes] ?? '';
                            const isFilled = noteValue.trim().length > 0;
                            return (
                                <div key={health.key} className="flex items-center space-x-3">
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`w-16 h-16 items-center justify-center rounded-full flex flex-col text-sm ${
                                                isFilled
                                                    ? 'bg-red-50 text-red-500'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            <health.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {health.label}
                                        </span>
                                    </div>
                                    <div className="flex-1 -mt-7">
                                        <div className="relative w-full bg-gray-100 rounded-2xl py-3 pl-4 pr-10">
                                            <input
                                                value={noteValue}
                                                onChange={e =>
                                                    setHealthNotes(prev => ({
                                                        ...prev,
                                                        [health.key]: e.target.value,
                                                    }))
                                                }
                                                placeholder="특이사항이 있다면 입력해주세요."
                                                className="w-full bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-400"
                                            >
                                                <AddPhotoIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordForm;
