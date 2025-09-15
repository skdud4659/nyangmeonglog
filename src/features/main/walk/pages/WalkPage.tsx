/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePetStore } from '@/shared/store/petStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

declare global {
    interface Window {
        kakao: any;
    }
}

type LatLng = { lat: number; lng: number };

const BodyPortal = ({ children }: { children: ReactNode }) => {
    if (typeof document === 'undefined') return null;
    const root = document.getElementById('root') ?? document.body;
    return createPortal(children, root);
};

const formatDuration = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const ss = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mm}:${ss}`;
};

const haversine = (a: LatLng, b: LatLng) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
};

const loadKakaoScript = (): Promise<void> => {
    if (window.kakao && window.kakao.maps) return Promise.resolve();
    const appkey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined;
    if (!appkey || appkey.trim().length === 0) {
        return Promise.reject(new Error('VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.'));
    }
    return new Promise((resolve, reject) => {
        const existing = document.getElementById('kakao-map-sdk') as HTMLScriptElement | null;
        if (existing) {
            existing.addEventListener('load', () => {
                if (window.kakao && window.kakao.maps) {
                    window.kakao.maps.load(() => resolve());
                } else {
                    reject(new Error('Kakao SDK 로드 실패(기존 스크립트)'));
                }
            });
            existing.addEventListener('error', () => reject(new Error('Kakao SDK 스크립트 에러')));
            return;
        }
        const script = document.createElement('script');
        const params = `appkey=${appkey}&autoload=false&libraries=services`;
        script.id = 'kakao-map-sdk';
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${params}`;
        script.async = true;
        script.onload = () => {
            if (!window.kakao || !window.kakao.maps) {
                reject(new Error('Kakao SDK 로드 실패'));
                return;
            }
            window.kakao.maps.load(() => resolve());
        };
        script.onerror = () => reject(new Error('Kakao SDK 스크립트 에러'));
        document.head.appendChild(script);
    });
};

const WalkPage = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);
    const photoMarkerRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const [, setPath] = useState<LatLng[]>([]);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    // 활성 펫 정보 (마커 이미지에 사용)
    const pets = usePetStore(state => state.pets);
    const activePetId = usePetStore(state => state.activePetId);
    const activePet = pets.find(p => p.id === activePetId);

    const buildPhotoMarkerElement = (imageUrl?: string) => {
        const size = 48;
        const wrap = document.createElement('div');
        wrap.style.width = `${size}px`;
        wrap.style.height = `${size}px`;
        wrap.style.borderRadius = '9999px';
        wrap.style.border = '3px solid #fff';
        wrap.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
        wrap.style.backgroundColor = '#f0f0f0';
        if (imageUrl) {
            wrap.style.backgroundImage = `url(${imageUrl})`;
            wrap.style.backgroundSize = 'cover';
            wrap.style.backgroundPosition = 'center';
        }
        return wrap;
    };

    useEffect(() => {
        const init = async () => {
            try {
                await loadKakaoScript();
                setIsReady(true);
            } catch (e: any) {
                console.error(e);
                setMapError(e?.message ?? '지도를 불러오지 못했어요.');
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!isReady || !mapContainerRef.current) return;
        navigator.geolocation.getCurrentPosition(
            pos => {
                const center = new window.kakao.maps.LatLng(
                    pos.coords.latitude,
                    pos.coords.longitude
                );
                mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
                    center,
                    level: 3,
                });
                polylineRef.current = new window.kakao.maps.Polyline({
                    map: mapRef.current,
                    strokeWeight: 6,
                    strokeColor: '#F38E8E',
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid',
                    endArrow: true,
                });
                // 커스텀 사진 마커
                const contentEl = buildPhotoMarkerElement(activePet?.photo_url ?? undefined);
                photoMarkerRef.current = new window.kakao.maps.CustomOverlay({
                    position: center,
                    content: contentEl,
                    yAnchor: 0.5,
                    xAnchor: 0.5,
                    zIndex: 2,
                });
                photoMarkerRef.current.setMap(mapRef.current);
                // 컨테이너 레이아웃 보정
                setTimeout(() => {
                    if (mapRef.current) mapRef.current.relayout?.();
                }, 0);
                const onResize = () => mapRef.current?.relayout?.();
                window.addEventListener('resize', onResize);
                return () => window.removeEventListener('resize', onResize);
            },
            err => {
                console.error(err);
                setMapError('현재 위치를 가져오지 못했어요. 위치 권한을 확인해 주세요.');
            },
            { enableHighAccuracy: true }
        );
    }, [isReady]);

    const startWalk = () => {
        if (isWalking) return;
        setShowSummary(false);
        setPath([]);
        setDistance(0);
        setDuration(0);
        setIsWalking(true);

        const startTime = Date.now();
        timerRef.current = window.setInterval(() => {
            setDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        watchIdRef.current = navigator.geolocation.watchPosition(
            pos => {
                const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPath(prev => {
                    const next = [...prev, point];
                    if (next.length >= 2) {
                        const add = haversine(next[next.length - 2], next[next.length - 1]);
                        setDistance(d => d + add);
                    }
                    // draw polyline
                    if (polylineRef.current) {
                        const kakaoPath = next.map(p => new window.kakao.maps.LatLng(p.lat, p.lng));
                        polylineRef.current.setPath(kakaoPath);
                    }
                    if (photoMarkerRef.current) {
                        photoMarkerRef.current.setPosition(
                            new window.kakao.maps.LatLng(point.lat, point.lng)
                        );
                    }
                    if (mapRef.current) {
                        mapRef.current.setCenter(
                            new window.kakao.maps.LatLng(point.lat, point.lng)
                        );
                    }
                    return next;
                });
            },
            err => {
                console.error(err);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
    };

    const stopWalk = () => {
        if (!isWalking) return;
        setIsWalking(false);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setShowSummary(true);
    };

    const km = useMemo(() => (distance / 1000).toFixed(2), [distance]);

    // 활성 펫 사진 변경 시 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !photoMarkerRef.current) return;
        const el = buildPhotoMarkerElement(activePet?.photo_url ?? undefined);
        photoMarkerRef.current.setContent(el);
    }, [activePet?.photo_url]);

    return (
        <div className="relative h-full w-full">
            <div
                ref={mapContainerRef}
                className="absolute inset-0"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 오류 배너 */}
            {mapError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white border rounded-xl px-4 py-2 text-sm text-gray-700 shadow">
                    {mapError}
                </div>
            )}

            {/* Bottom control panel */}
            <div className="absolute left-0 right-0 bottom-0 z-10">
                <div
                    className="px-6 pt-5 pb-6 bg-white rounded-t-2xl border-t"
                    style={{ boxShadow: '0px -1px 19px 0px rgba(202, 202, 202, 0.25)' }}
                >
                    <div className="flex items-center justify-around mb-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-500">산책시간</div>
                            <div className="text-3xl font-bold tracking-widest">
                                {formatDuration(duration)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500">이동거리</div>
                            <div className="text-3xl font-bold">{km} km</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className={`flex-1 h-12 rounded-full text-white font-semibold ${
                                isWalking ? 'bg-red-400' : 'bg-primary'
                            }`}
                            onClick={() => (isWalking ? setShowConfirm(true) : startWalk())}
                        >
                            {isWalking ? '산책 종료' : '산책 시작!'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm modal */}
            <AnimatePresence>
                {showConfirm && (
                    <BodyPortal>
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black z-[1000]"
                                onClick={() => setShowConfirm(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-white rounded-2xl p-5 w-80"
                            >
                                <div className="text-center mb-4">정말로 산책을 끝내시겠어요?</div>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 h-11 rounded-full border"
                                        onClick={() => setShowConfirm(false)}
                                    >
                                        더 할게요!
                                    </button>
                                    <button
                                        className="flex-1 h-11 rounded-full bg-red-400 text-white"
                                        onClick={() => {
                                            setShowConfirm(false);
                                            stopWalk();
                                        }}
                                    >
                                        산책 끝!
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    </BodyPortal>
                )}
            </AnimatePresence>

            {/* Summary panel */}
            <AnimatePresence>
                {showSummary && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl p-6 z-10"
                        style={{ boxShadow: '0px -1px 19px 0px rgba(202, 202, 202, 0.25)' }}
                    >
                        <div className="mb-3">
                            <div className="text-lg font-semibold">즐거운 시간 보내셨나요?</div>
                        </div>
                        <div className="flex items-center justify-around mb-4">
                            <div className="text-center">
                                <div className="text-sm text-gray-500">산책시간</div>
                                <div className="text-2xl font-bold text-red-400">
                                    {formatDuration(duration)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">이동거리</div>
                                <div className="text-2xl font-bold">{km} km</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 h-12 rounded-full border" onClick={startWalk}>
                                다시 걷기
                            </button>
                            <button
                                className="flex-1 h-12 rounded-full bg-primary text-white"
                                onClick={() => setShowSummary(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalkPage;
