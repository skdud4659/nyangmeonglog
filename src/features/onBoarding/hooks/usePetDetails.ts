import { petInfoSchema, type PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';
import { useState } from 'react';

export const usePetDetails = () => {
    const [pets, setPets] = useState<PetInfoData[]>([]);

    const updatePet = (index: number, updates: Partial<PetInfoData>) => {
        setPets(prev => prev.map((pet, i) => (i === index ? { ...pet, ...updates } : pet)));
    };

    const validate = (index: number) => {
        petInfoSchema.parse(pets[index]);
    };

    return {
        pets,
        setPets,
        updatePet,
        validate,
    };
};
