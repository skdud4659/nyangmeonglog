/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWalkById, type WalkItem } from '@/features/main/walk/api/walksApi';
import { ensureKakaoMapsLoaded } from '@/shared/lib/kakao';
import { usePetStore } from '@/shared/store/petStore';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        kakao: any;
    }
}

const WalkDetailPage = ({ id }: { id: string }) => {
    const navigate = useNavigate();
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<{ distanceKm: string; durationMin: number } | null>(null);
    const [walk, setWalk] = useState<WalkItem | null>(null);
    const pets = usePetStore(s => s.pets);

    useEffect(() => {
        const waitForContainer = (el: HTMLDivElement, timeoutMs = 2000): Promise<void> => {
            const start = Date.now();
            return new Promise(resolve => {
                const check = () => {
                    const rect = el.getBoundingClientRect();
                    const visible = rect.width > 0 && rect.height > 0 && !!el.offsetParent;
                    if (visible || Date.now() - start > timeoutMs) return resolve();
                    requestAnimationFrame(check);
                };
                check();
            });
        };
        const run = async () => {
            try {
                const w = await getWalkById(id);
                setWalk(w);
                await ensureKakaoMapsLoaded();
                setInfo({
                    distanceKm: (w.distanceM / 1000).toFixed(2),
                    durationMin: Math.floor(w.durationSec / 60),
                });
                // 페이지 렌더 완료 후 다음 프레임에서 ref 확인
                await new Promise(resolve =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve))
                );
                if (!mapContainerRef.current) {
                    setError('지도 컨테이너가 준비되지 않았어요. (ref null)');
                    setLoading(false);
                    return;
                }
                // 컨테이너가 표시될 때까지 대기 + 보정
                if (mapContainerRef.current.clientHeight < 50) {
                    mapContainerRef.current.style.height = '60vh';
                }
                await waitForContainer(mapContainerRef.current, 2000);
                const center = w.path.length
                    ? new window.kakao.maps.LatLng(w.path[0].lat, w.path[0].lng)
                    : new window.kakao.maps.LatLng(37.5665, 126.978);
                mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
                    center,
                    level: 4,
                });
                if (w.path.length) {
                    const kakaoPath = w.path.map(p => new window.kakao.maps.LatLng(p.lat, p.lng));
                    new window.kakao.maps.Polyline({
                        map: mapRef.current as any,
                        path: kakaoPath,
                        strokeWeight: 6,
                        strokeColor: '#F38E8E',
                        strokeOpacity: 0.8,
                        strokeStyle: 'solid',
                    });
                    const bounds = new window.kakao.maps.LatLngBounds();
                    kakaoPath.forEach((pt: any) => bounds.extend(pt));
                    mapRef.current.setBounds(bounds);
                }
                // 초기 렌더 후 레이아웃 강제 갱신 (지연)
                setTimeout(() => mapRef.current?.relayout?.(), 150);
                setLoading(false);
            } catch (e: any) {
                setError(e?.message ?? '기록을 불러오지 못했어요.');
                setLoading(false);
            }
        };
        // mount 후(렌더 완료) 실행
        const idFrame = requestAnimationFrame(() => run());
        return () => cancelAnimationFrame(idFrame);
    }, [id]);

    const startedStr = walk ? new Date(walk.startedAt) : null;
    const dateTitle = startedStr
        ? `${startedStr.getFullYear()}.${String(startedStr.getMonth() + 1).padStart(2, '0')}.${String(
              startedStr.getDate()
          ).padStart(2, '0')}`
        : '';
    const pet = walk ? pets.find(p => p.id === walk.petId) : undefined;

    return (
        <div className="relative flex flex-col h-full">
            {/* 지도 */}
            <div
                ref={mapContainerRef}
                className="absolute inset-0"
                style={{ minHeight: '320px' }}
            />

            {/* 상단 뒤로가기 버튼 */}
            <div className="absolute left-3 top-3 z-20 pointer-events-auto">
                <button
                    aria-label="뒤로가기"
                    className="flex items-center justify-center text-gray-700"
                    onClick={() => navigate({ to: '/main/walk/history' })}
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* 상단 정보 카드 */}
            <div className="pointer-events-none absolute left-0 right-0 top-9 z-10 p-4">
                <div
                    className="mx-auto w-full max-w-md rounded-2xl bg-white shadow"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
                >
                    <div className="px-5 pt-4 pb-3">
                        <div className="text-gray-900 font-extrabold text-xl">{dateTitle}</div>
                        <div className="mt-1 text-gray-800 font-semibold">
                            <span>{pet?.name ?? ''}</span>
                            <span>와 함께 산책했어요</span>
                        </div>
                        {info && (
                            <div className="mt-3 grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-xs text-gray-500">산책시간</div>
                                    <div className="mt-1 text-2xl font-extrabold text-red-400">
                                        {String(Math.floor((walk?.durationSec ?? 0) / 60)).padStart(
                                            2,
                                            '0'
                                        )}
                                        :{String((walk?.durationSec ?? 0) % 60).padStart(2, '0')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">이동거리</div>
                                    <div className="mt-1 text-2xl font-extrabold text-gray-900">
                                        {info.distanceKm} km
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-gray-700">
                    불러오는 중...
                </div>
            )}
            {error && !loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border rounded-xl px-4 py-2 text-sm text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
};

export default WalkDetailPage;
