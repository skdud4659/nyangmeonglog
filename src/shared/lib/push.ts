import { supabase } from '@/shared/lib/supabase';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;
    try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        return reg;
    } catch (e) {
        console.warn('ServiceWorker register failed', e);
        return null;
    }
};

export const initPushForUser = async (userId: string): Promise<void> => {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidPublicKey) {
        console.warn('Missing VITE_VAPID_PUBLIC_KEY');
        return;
    }
    if (!('Notification' in window) || Notification.permission === 'denied') return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = (await registerServiceWorker()) as ServiceWorkerRegistration | null;
    if (!reg) return;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
        sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
    }

    const json = sub.toJSON() as any;
    const endpoint: string = json.endpoint;
    const p256dh: string = json.keys?.p256dh;
    const auth: string = json.keys?.auth;

    await supabase
        .from('push_subscriptions')
        .upsert({ user_id: userId, endpoint, p256dh, auth }, { onConflict: 'endpoint' });
};
