import { petCountSchema, type PetCountData } from '@/features/onBoarding/schemas/petCountSchema';
import { useState } from 'react';

export const usePetCount = () => {
    // 데이터 임시 입력
    const [petCount, setPetCount] = useState<PetCountData>({
        dogs: 0,
        cats: 1,
    });

    const validate = () => {
        petCountSchema.parse(petCount);
    };

    return {
        petCount,
        setPetCount,
        validate,
    };
};
