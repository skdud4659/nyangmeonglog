import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'simple' | 'detail';

type SettingsState = {
    mode: AppMode;
};

type SettingsActions = {
    setMode: (mode: AppMode) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
    persist(
        set => ({
            mode: 'simple',
            setMode: mode => set({ mode }),
        }),
        { name: 'nyangmeonglog-settings' }
    )
);
