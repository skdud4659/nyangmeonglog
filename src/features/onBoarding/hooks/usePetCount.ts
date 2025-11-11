import { petCountSchema, type PetCountData } from '@/features/onBoarding/schemas/petCountSchema';
import { useState } from 'react';
import { z } from 'zod';

export const usePetCount = () => {
    const [petCount, setPetCount] = useState<PetCountData>({
        dogs: 0,
        cats: 0,
    });

    const validate = () => {
        try {
            petCountSchema.parse(petCount);
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                console.log(err.issues);
            }
            return false;
        }
    };

    return {
        petCount,
        setPetCount,
        validate,
    };
};
