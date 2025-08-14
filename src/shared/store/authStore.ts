import { supabase } from '@/shared/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
    session: Session | null;
    user: User | null;
    isInitialized: boolean;
};

type AuthActions = {
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>(set => ({
    session: null,
    user: null,
    isInitialized: false,
    initialize: async () => {
        const { data } = await supabase.auth.getSession();
        set({
            session: data.session ?? null,
            user: data.session?.user ?? null,
            isInitialized: true,
        });
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session: session ?? null, user: session?.user ?? null });
        });
    },
    signOut: async () => {
        await supabase.auth.signOut();
    },
}));
