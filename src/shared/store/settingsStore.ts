import { supabase } from '@/shared/lib/supabase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'simple' | 'detail';

type SettingsState = {
    mode: AppMode;
};

type SettingsActions = {
    setMode: (mode: AppMode) => void;
    syncModeFromProfile: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
    persist(
        (set, get) => ({
            mode: 'simple',
            setMode: async mode => {
                set({ mode });
                try {
                    const { data: auth } = await supabase.auth.getUser();
                    const userId = auth.user?.id;
                    if (userId) {
                        await supabase.from('profiles').update({ mode }).eq('id', userId);
                    }
                } catch {}
            },
            syncModeFromProfile: async () => {
                try {
                    const { data: auth } = await supabase.auth.getUser();
                    const userId = auth.user?.id;
                    if (!userId) return;
                    const { data } = await supabase
                        .from('profiles')
                        .select('mode')
                        .eq('id', userId)
                        .single();
                    const mode = (data?.mode as AppMode) || 'simple';
                    set({ mode });
                } catch {}
            },
        }),
        { name: 'nyangmeonglog-settings' }
    )
);
