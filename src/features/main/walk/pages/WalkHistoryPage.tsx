import { listWalks, type WalkItem } from '@/features/main/walk/api/walksApi';
import { useAuthStore } from '@/shared/store/authStore';
import { usePetStore } from '@/shared/store/petStore';
import { useEffect, useMemo, useState } from 'react';

const WalkHistoryPage = () => {
    const user = useAuthStore(s => s.user);
    const petId = usePetStore(s => s.activePetId);
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [items, setItems] = useState<WalkItem[]>([]);

    useEffect(() => {
        const run = async () => {
            if (!user?.id) return;
            const data = await listWalks({
                userId: user.id,
                petId: petId ?? undefined,
                year,
                month,
            });
            setItems(data);
        };
        run();
    }, [user?.id, petId, year, month]);

    const grouped = useMemo(() => {
        const map = new Map<string, WalkItem[]>();
        for (const it of items) {
            const d = it.startedAt.slice(0, 10);
            if (!map.has(d)) map.set(d, []);
            map.get(d)!.push(it);
        }
        return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    }, [items]);

    const decMonth = () => {
        const m = new Date(year, month - 1, 1);
        setYear(m.getFullYear());
        setMonth(m.getMonth());
    };
    const incMonth = () => {
        const m = new Date(year, month + 1, 1);
        setYear(m.getFullYear());
        setMonth(m.getMonth());
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <button className="px-3 py-1 border rounded" onClick={decMonth}>
                    이전
                </button>
                <div className="font-semibold">
                    {year}년 {month + 1}월
                </div>
                <button className="px-3 py-1 border rounded" onClick={incMonth}>
                    다음
                </button>
            </div>

            {grouped.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">이 달의 산책 기록이 없어요.</div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([date, list]) => (
                        <div key={date}>
                            <div className="mb-2 font-semibold">{date}</div>
                            <div className="space-y-2">
                                {list.map(it => (
                                    <div
                                        key={it.id}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-white"
                                    >
                                        <div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(it.startedAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                            <div className="text-gray-800">
                                                {(it.distanceM / 1000).toFixed(2)} km ·{' '}
                                                {Math.floor(it.durationSec / 60)}분
                                            </div>
                                        </div>
                                        <a
                                            className="text-primary text-sm"
                                            href={`/main/walk/history/${it.id}`}
                                        >
                                            자세히
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WalkHistoryPage;
