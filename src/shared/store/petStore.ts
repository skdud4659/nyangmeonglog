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
    updatePetInStore: (petId: string, updates: Partial<PetItem>) => void;
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
    updatePetInStore: (petId: string, updates: Partial<PetItem>) =>
        set(state => ({
            pets: state.pets.map(p => (p.id === petId ? { ...p, ...updates } : p)),
        })),
}));

export const useActivePet = (): PetItem | undefined => {
    const { pets, activePetId } = usePetStore();
    return pets.find(p => p.id === activePetId);
};
