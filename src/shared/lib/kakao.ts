declare global {
    interface Window {
        kakao: any;
    }
}

export const ensureKakaoMapsLoaded = (): Promise<void> => {
    if (typeof window === 'undefined') return Promise.reject(new Error('window unavailable'));
    if (window.kakao && window.kakao.maps) return Promise.resolve();
    const appkey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined;
    if (!appkey || appkey.trim().length === 0) {
        return Promise.reject(new Error('VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.'));
    }
    return new Promise((resolve, reject) => {
        const existing = document.getElementById('kakao-map-sdk') as HTMLScriptElement | null;
        const onLoaded = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => resolve());
            } else {
                reject(new Error('Kakao SDK 로드 실패'));
            }
        };
        if (existing) {
            existing.addEventListener('load', onLoaded, { once: true });
            existing.addEventListener('error', () => reject(new Error('Kakao SDK 스크립트 에러')), {
                once: true,
            });
            if ((existing as any)._loaded) onLoaded();
            return;
        }
        const script = document.createElement('script');
        const params = `appkey=${appkey}&autoload=false&libraries=services`;
        script.id = 'kakao-map-sdk';
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${params}`;
        script.async = true;
        script.onload = () => {
            (script as any)._loaded = true;
            onLoaded();
        };
        script.onerror = () => reject(new Error('Kakao SDK 스크립트 에러'));
        document.head.appendChild(script);
    });
};
