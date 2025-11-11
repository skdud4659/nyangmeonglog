import { getUserPets, type PetItem } from '@/features/main/home/api/petsApi';
import {
    getActivePetId as dbGetActive,
    setActivePetId as dbSetActive,
} from '@/shared/api/profileApi';
import { useAuthStore } from '@/shared/store/authStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const usePetStore = create<PetState & PetActions>()(
    persist(
        set => ({
            pets: [],
            activePetId: null,
            isLoading: false,
            loadPetsForCurrentUser: async () => {
                const user = useAuthStore.getState().user;
                if (!user?.id) return;
                set({ isLoading: true });
                try {
                    const list = await getUserPets(user.id);
                    const currentActive = usePetStore.getState().activePetId;
                    const dbActive = await dbGetActive();
                    // 우선순위: 현재 상태(activePetId) -> DB 저장값 -> 첫 번째 펫
                    let chosen: string | null = null;
                    if (currentActive && list.find(p => p.id === currentActive))
                        chosen = currentActive;
                    else if (dbActive && list.find(p => p.id === dbActive)) chosen = dbActive;
                    else chosen = list[0]?.id ?? null;

                    // DB와 상태 동기화
                    if (chosen !== dbActive) {
                        await dbSetActive(chosen);
                    }
                    set({ pets: list, activePetId: chosen });
                } finally {
                    set({ isLoading: false });
                }
            },
            setActivePetId: (petId: string) => {
                dbSetActive(petId).catch(() => {});
                set({ activePetId: petId });
            },
            updatePetInStore: (petId: string, updates: Partial<PetItem>) =>
                set(state => ({
                    pets: state.pets.map(p => (p.id === petId ? { ...p, ...updates } : p)),
                })),
        }),
        {
            name: 'nyangmeonglog-pet',
            partialize: state => ({ activePetId: state.activePetId }),
        }
    )
);

export const useActivePet = (): PetItem | undefined => {
    const { pets, activePetId } = usePetStore();
    return pets.find(p => p.id === activePetId);
};
