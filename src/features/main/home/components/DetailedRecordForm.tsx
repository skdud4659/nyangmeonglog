import { getPetById, updatePet } from '@/features/main/home/api/petsApi';
import { upsertSimpleRecord } from '@/features/main/home/api/recordsApi';
import { eventIconMap } from '@/features/main/home/composables/iconsMap';
import type { SimpleRecord } from '@/features/main/home/types/record';
import AddPhotoIcon from '@/shared/assets/icons/addPhotoIcon.svg?react';
import ClearIcon from '@/shared/assets/icons/clearIcon.svg?react';
import SheetHeader from '@/shared/components/molecules/SheetHeader';
import { useAuthStore } from '@/shared/store/authStore';
import { usePetStore } from '@/shared/store/petStore';
import { useEffect, useMemo, useState } from 'react';

type TabKey = 'feed' | 'water' | 'poop' | 'pee' | 'snack' | 'health' | 'extra';

interface DetailedRecordFormProps {
    selectedDate: number;
    currentMonth: number;
    currentYear: number;
    petId: string;
    onClose: () => void;
    initialRecord?: SimpleRecord | null;
    onSaved?: (record: SimpleRecord) => void;
}

const DetailedRecordForm = ({
    selectedDate,
    currentMonth,
    currentYear,
    petId,
    onClose,
    initialRecord,
    onSaved,
}: DetailedRecordFormProps) => {
    const user = useAuthStore(state => state.user);

    const dateStr = useMemo(() => {
        return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    }, [currentYear, currentMonth, selectedDate]);

    const [tab, setTab] = useState<TabKey>('feed');
    const updatePetInStore = usePetStore(s => s.updatePetInStore);

    const tabs: { key: TabKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
        { key: 'feed', label: '사료&간식', Icon: eventIconMap.feed },
        { key: 'water', label: '물', Icon: eventIconMap.water },
        { key: 'poop', label: '대변', Icon: eventIconMap.poop },
        { key: 'pee', label: '소변', Icon: eventIconMap.pee },
        { key: 'extra', label: '미용', Icon: eventIconMap.grooming },
        { key: 'health', label: '건강', Icon: eventIconMap.checkup },
    ];

    const FeedIcon = eventIconMap.feed;
    const SnackIcon = eventIconMap.snack;
    const WaterIcon = eventIconMap.water;
    const PoopIcon = eventIconMap.poop;
    const PeeIcon = eventIconMap.pee;
    const CheckupIcon = eventIconMap.checkup;
    const MedicineIcon = eventIconMap.medicine;
    const GroomingIcon = eventIconMap.grooming;

    // 간단 레코드 모델을 그대로 사용하되 입력을 탭별로 쪼갠다
    const [food] = useState<boolean>(initialRecord?.food ?? false);
    const [water] = useState<boolean>(initialRecord?.water ?? false);
    const [snack, setSnack] = useState<boolean>(initialRecord?.snack ?? false);
    const [poop] = useState<boolean>(initialRecord?.poop ?? false);
    const [pee] = useState<boolean>(initialRecord?.pee ?? false);
    const [extras, setExtras] = useState({
        brush: initialRecord?.extras?.brush ?? false,
        bath: initialRecord?.extras?.bath ?? false,
        grooming: initialRecord?.extras?.grooming ?? false,
    });
    const [health, setHealth] = useState({
        spasm: initialRecord?.health?.spasm?.note ?? '',
        vaccination: initialRecord?.health?.vaccination?.note ?? '',
        checkup: initialRecord?.health?.checkup?.note ?? '',
    });
    const [healthOn, setHealthOn] = useState({
        spasm: !!initialRecord?.health?.spasm?.note,
        vaccination: !!initialRecord?.health?.vaccination?.note,
        checkup: !!initialRecord?.health?.checkup?.note,
    });

    // 상세 입력 전용 상태 (디자인 반영)
    const [feedCount, setFeedCount] = useState<number>(initialRecord?.food ? 1 : 0);
    const [feedAmount, setFeedAmount] = useState<string>('');
    const [isBowlClean, setIsBowlClean] = useState<boolean | null>(null);
    const [snackCount, setSnackCount] = useState<number>(initialRecord?.snack ? 1 : 0);
    const [waterAmount, setWaterAmount] = useState<string>('');
    const [poopCount, setPoopCount] = useState<number>(initialRecord?.poop ? 1 : 0);
    const [peeCount, setPeeCount] = useState<number>(initialRecord?.pee ? 1 : 0);
    const [poopColor, setPoopColor] = useState<string>('');
    const [peeColor, setPeeColor] = useState<string>('');
    const [poopNote, setPoopNote] = useState<string>('');
    const [peeNote, setPeeNote] = useState<string>('');
    const [extraNote, setExtraNote] = useState<string>('');

    // 영양제 (simpleRecordForm과 동일한 패턴)
    const [supplements, setSupplements] = useState<string[]>([]);
    const [selectedSupplementNames, setSelectedSupplementNames] = useState<Set<string>>(new Set());
    const [newSupplementName, setNewSupplementName] = useState<string>('');

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
            // 서버 반영
            updatePet(petId, { supplements: next })
                .then(() => updatePetInStore(petId, { supplements: next }))
                .catch(() => {});
            return next;
        });
        // 기본은 선택되지 않음 (체크 off)
        setSelectedSupplementNames(prev => new Set(prev));
        setNewSupplementName('');
    };

    const handleDeleteSupplement = async (name: string) => {
        setSupplements(prev => {
            const next = prev.filter(n => n !== name);
            updatePet(petId, { supplements: next })
                .then(() => updatePetInStore(petId, { supplements: next }))
                .catch(() => {});
            return next;
        });
        setSelectedSupplementNames(prev => {
            const next = new Set(prev);
            next.delete(name);
            return next;
        });
    };

    // 처음 진입 시 활성 펫의 영양제 목록을 동기화
    useEffect(() => {
        let cancelled = false;
        const sync = async () => {
            try {
                // 항상 서버에서 최신 반려동물 영양제 목록을 가져와 표시
                const pet = await getPetById(petId);
                const list = pet?.supplements ?? [];
                if (!cancelled) {
                    setSupplements(list);
                    // 기본은 미선택이지만, 이미 선택값이 있거나 수정모드로 넘어온 값이 있으면 유지
                    setSelectedSupplementNames(prev => {
                        if (prev.size > 0) return prev;
                        const hasInitial = (initialRecord?.supplements?.length ?? 0) > 0;
                        return hasInitial ? new Set(initialRecord?.supplements) : new Set();
                    });
                }
            } catch {
                // ignore fetch error, keep empty list
            }
        };
        sync();
        return () => {
            cancelled = true;
        };
    }, [petId, initialRecord?.supplements]);

    // 기존 기록으로 들어온 경우(수정 모드)에는 해당 날짜의 복용 목록을 기본 선택 상태로 세팅
    useEffect(() => {
        const used = initialRecord?.supplements ?? [];
        if (used.length === 0) return;
        setSelectedSupplementNames(new Set(used));
        setSupplements(prev => {
            const merged = new Set([...prev, ...used]);
            return Array.from(merged);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRecord?.id]);

    const handleSave = async () => {
        if (!user?.id) return onClose();
        const saved = await upsertSimpleRecord({
            userId: user.id,
            petId,
            date: dateStr,
            food: food || feedCount > 0,
            water:
                water ||
                (!!waterAmount && !isNaN(parseFloat(waterAmount)) && parseFloat(waterAmount) > 0),
            snack: snack || snackCount > 0,
            poop: poop || poopCount > 0,
            pee: pee || peeCount > 0,
            supplements: Array.from(selectedSupplementNames),
            extras,
            health: {
                spasm: { note: health.spasm || undefined },
                vaccination: { note: health.vaccination || undefined },
                checkup: { note: health.checkup || undefined },
            },
        });
        onSaved?.(saved);
        onClose();
    };

    const TabButton = ({
        k,
        label,
        Icon,
    }: {
        k: TabKey;
        label: string;
        Icon: React.FC<{ className?: string }>;
    }) => (
        <div className="flex flex-col items-center gap-2">
            <button
                className={`flex flex-col w-12 h-12 items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                    tab === k
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-white text-gray-600 border-gray-200'
                }`}
                onClick={() => setTab(k)}
            >
                <Icon className="w-6 h-6" />
            </button>
            <span className="text-xs">{label}</span>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <SheetHeader
                title={`${currentMonth + 1}월 ${selectedDate}일`}
                onClose={onClose}
                onPrimary={handleSave}
                primaryLabel="저장"
            />

            <div className="p-4 grid grid-cols-6 overflow-x-auto border-b">
                {tabs.map(t => (
                    <TabButton key={t.key} k={t.key} label={t.label} Icon={t.Icon} />
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {tab === 'feed' && (
                    <section className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FeedIcon className="w-5 h-5 text-red-400" />
                                <h3 className="text-base font-semibold">사료</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">급여횟수</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                            onClick={() => setFeedCount(v => Math.max(0, v - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center">{feedCount}</span>
                                        <button
                                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                            onClick={() => setFeedCount(v => v + 1)}
                                        >
                                            +
                                        </button>
                                        <span className="text-gray-500 ml-1">회</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">급여량</span>
                                    <div className="flex items-center">
                                        <input
                                            className="w-28 border rounded-lg px-3 py-2 text-right"
                                            inputMode="numeric"
                                            placeholder="0"
                                            value={feedAmount}
                                            onChange={e => setFeedAmount(e.target.value)}
                                        />
                                        <span className="ml-2 text-gray-500">g</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">그릇은 청결한가요?</span>
                                    <div className="flex gap-2">
                                        <button
                                            className={`px-5 py-2 rounded-lg text-sm ${
                                                isBowlClean === true
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                            onClick={() => setIsBowlClean(true)}
                                        >
                                            네
                                        </button>
                                        <button
                                            className={`px-5 py-2 rounded-lg text-sm ${
                                                isBowlClean === false
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                            onClick={() => setIsBowlClean(false)}
                                        >
                                            아니오
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 mb-3">
                                <SnackIcon className="w-5 h-5 text-red-400" />
                                <h3 className="text-base font-semibold">간식</h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">급여횟수</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                        onClick={() => setSnackCount(v => Math.max(0, v - 1))}
                                    >
                                        -
                                    </button>
                                    <span className="w-6 text-center">{snackCount}</span>
                                    <button
                                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                        onClick={() => setSnackCount(v => v + 1)}
                                    >
                                        +
                                    </button>
                                    <span className="text-gray-500 ml-1">회</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {tab === 'water' && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <WaterIcon className="w-5 h-5 text-blue-400" />
                            <h3 className="text-base font-semibold">물</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">섭취량</span>
                            <div className="flex items-center">
                                <input
                                    className="w-28 border rounded-lg px-3 py-2 text-right"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={waterAmount}
                                    onChange={e => setWaterAmount(e.target.value)}
                                />
                                <span className="ml-2 text-gray-500">ml</span>
                            </div>
                        </div>
                    </section>
                )}
                {tab === 'poop' && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <PoopIcon className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base font-semibold">대변</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">횟수</span>
                            <div className="flex items-center gap-2">
                                <button
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                    onClick={() => setPoopCount(v => Math.max(0, v - 1))}
                                >
                                    -
                                </button>
                                <span className="w-6 text-center">{poopCount}</span>
                                <button
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                    onClick={() => setPoopCount(v => v + 1)}
                                >
                                    +
                                </button>
                                <span className="text-gray-500 ml-1">회</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-gray-600">색</div>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {[
                                    { key: 'brown', label: '갈색', dot: 'bg-amber-700' },
                                    { key: 'gray', label: '회색', dot: 'bg-gray-400' },
                                    { key: 'yellow', label: '노란색', dot: 'bg-yellow-400' },
                                    { key: 'orange', label: '주황색', dot: 'bg-orange-400' },
                                    { key: 'blood', label: '혈변', dot: 'bg-red-500' },
                                    { key: 'purple', label: '보라색', dot: 'bg-purple-500' },
                                ].map(c => (
                                    <div
                                        onClick={() => setPoopColor(c.key)}
                                        key={c.key}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white ${
                                            poopColor === c.key
                                                ? 'border-primary text-primary'
                                                : 'border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                                        {c.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-gray-600">상태</div>
                            <textarea
                                className="w-full border rounded-2xl p-3 text-sm"
                                placeholder="특이사항이 있다면 입력해주세요."
                                value={poopNote}
                                onChange={e => setPoopNote(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </section>
                )}
                {tab === 'pee' && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <PeeIcon className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-base font-semibold">소변</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">횟수</span>
                            <div className="flex items-center gap-2">
                                <button
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                    onClick={() => setPeeCount(v => Math.max(0, v - 1))}
                                >
                                    -
                                </button>
                                <span className="w-6 text-center">{peeCount}</span>
                                <button
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-700"
                                    onClick={() => setPeeCount(v => v + 1)}
                                >
                                    +
                                </button>
                                <span className="text-gray-500 ml-1">회</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-gray-600">색</div>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {[
                                    { key: 'clear', label: '투명색', dot: 'bg-gray-200' },
                                    { key: 'yellow', label: '진노란색', dot: 'bg-yellow-300' },
                                    {
                                        key: 'orange-dark',
                                        label: '진한 주황색',
                                        dot: 'bg-orange-500',
                                    },
                                    { key: 'green', label: '초록색', dot: 'bg-green-500' },
                                    { key: 'brown-dark', label: '진한 갈색', dot: 'bg-amber-800' },
                                    { key: 'blood', label: '혈뇨', dot: 'bg-red-500' },
                                ].map(c => (
                                    <div
                                        key={c.key}
                                        onClick={() => setPeeColor(c.key)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white ${
                                            peeColor === c.key
                                                ? 'border-primary text-primary'
                                                : 'border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                                        <span>{c.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-gray-600">상태</div>
                            <textarea
                                className="w-full border rounded-2xl p-3 text-sm "
                                placeholder="특이사항이 있다면 입력해주세요."
                                value={peeNote}
                                onChange={e => setPeeNote(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </section>
                )}
                {tab === 'snack' && (
                    <section className="space-y-4">
                        <p className="font-medium">간식</p>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={snack}
                                onChange={e => setSnack(e.target.checked)}
                            />
                            급여함
                        </label>
                    </section>
                )}
                {tab === 'health' && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <CheckupIcon className="w-5 h-5 text-green-500" />
                            <h3 className="text-base font-semibold">건강</h3>
                        </div>

                        {[
                            { key: 'spasm', label: '구충' },
                            { key: 'vaccination', label: '접종' },
                            { key: 'checkup', label: '건강검진' },
                        ].map(item => {
                            const value = health[item.key as keyof typeof health] as string;
                            const on = healthOn[item.key as keyof typeof healthOn];
                            return (
                                <div key={item.key} className="flex items-center gap-3">
                                    <div
                                        className={`relative w-6 h-6 rounded-full bg-white border-2 cursor-pointer ${on ? 'border-primary' : 'border-gray_2'}`}
                                        onClick={() =>
                                            setHealthOn(prev => ({
                                                ...prev,
                                                [item.key]: !prev[item.key as keyof typeof prev],
                                            }))
                                        }
                                    >
                                        {on && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <span className="w-16 text-gray-700">{item.label}</span>
                                    <div className="flex-1 -mt-1">
                                        <div className="relative w-full border rounded-2xl py-3 pl-4 pr-10">
                                            <input
                                                value={value}
                                                onChange={e =>
                                                    setHealth(prev => ({
                                                        ...prev,
                                                        [item.key]: e.target.value,
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
                        {/* 영양제 */}
                        <div>
                            <div className="mb-3 font-medium flex items-center gap-2">
                                <MedicineIcon className="w-4 h-4 text-red-400" />
                                <span>영양제</span>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={newSupplementName}
                                    onChange={e => setNewSupplementName(e.target.value)}
                                    placeholder="영양제 이름을 입력하세요"
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
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
                                            <div
                                                key={name}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                    onClick={() => toggleSupplement(name)}
                                                >
                                                    <div
                                                        className={`relative w-6 h-6 rounded-full bg-white border-2 ${selected ? 'border-primary' : 'border-gray_2'}`}
                                                    >
                                                        {selected && (
                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-700">
                                                        {name}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label={`${name} 삭제`}
                                                    className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-400"
                                                    onClick={() => handleDeleteSupplement(name)}
                                                >
                                                    <ClearIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </section>
                )}
                {tab === 'extra' && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <GroomingIcon className="w-5 h-5 text-purple-500" />
                            <h3 className="text-base font-semibold">미용</h3>
                        </div>
                        {[
                            { key: 'brush', label: '양치' },
                            { key: 'bath', label: '목욕' },
                            { key: 'grooming', label: '미용' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center gap-3">
                                <div
                                    className={`relative w-6 h-6 rounded-full bg-white border-2 cursor-pointer ${extras[item.key as keyof typeof extras] ? 'border-primary' : 'border-gray_2'}`}
                                    onClick={() =>
                                        setExtras(prev => ({
                                            ...prev,
                                            [item.key]: !prev[item.key as keyof typeof prev],
                                        }))
                                    }
                                >
                                    {extras[item.key as keyof typeof extras] && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                                    )}
                                </div>
                                <span className="w-16 text-gray-700">{item.label}</span>
                                <div className="flex-1 -mt-1">
                                    <div className="relative w-full border rounded-2xl py-3 pl-4 pr-10">
                                        <input
                                            value={extraNote}
                                            onChange={e => setExtraNote(e.target.value)}
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
                        ))}

                        <div className="space-y-2">
                            <div className="text-gray-600">상태</div>
                            <textarea
                                className="w-full border rounded-2xl p-3 text-sm"
                                placeholder="특이사항이 있다면 입력해주세요."
                                value={extraNote}
                                onChange={e => setExtraNote(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default DetailedRecordForm;
