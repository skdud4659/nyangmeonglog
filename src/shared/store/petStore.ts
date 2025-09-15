import { getUserPets, type PetItem } from '@/features/main/home/api/petsApi';
import { useAuthStore } from '@/shared/store/authStore';
import { create } from 'zustand';

type PetState = {
    pets: PetItem[];
    activePetId: string | null;
    isLoading: boolean;
};

type PetActions = {
    loadPetsForCurrentUser: () => Promise<void>;
    setActivePetId: (petId: string) => void;
};

export const usePetStore = create<PetState & PetActions>((set, get) => ({
    pets: [],
    activePetId: null,
    isLoading: false,
    loadPetsForCurrentUser: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;
        set({ isLoading: true });
        try {
            const list = await getUserPets(user.id);
            const currentActive = get().activePetId;
            set({ pets: list, activePetId: currentActive ?? list[0]?.id ?? null });
        } finally {
            set({ isLoading: false });
        }
    },
    setActivePetId: (petId: string) => set({ activePetId: petId }),
}));
