import { petInfoSchema, type PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';
import { useState } from 'react';
import { z } from 'zod';

export const usePetDetails = () => {
    const [pets, setPets] = useState<PetInfoData[]>([]);

    const updatePet = (index: number, updates: Partial<PetInfoData>) => {
        setPets(prev => prev.map((pet, i) => (i === index ? { ...pet, ...updates } : pet)));
    };

    const validate = (index: number) => {
        try {
            petInfoSchema.parse(pets[index]);
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                console.log(err.issues);
            }
            return false;
        }
    };

    return {
        pets,
        setPets,
        updatePet,
        validate,
    };
};
