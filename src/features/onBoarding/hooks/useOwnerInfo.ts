import { ownerInfoSchema, type OwnerInfoData } from '@/features/onBoarding/schemas/ownerInfoSchema';
import { useState } from 'react';
import { z } from 'zod';

export const useOwnerInfo = () => {
    const [ownerInfo, setOwnerInfo] = useState<OwnerInfoData>({
        name: '',
        photo: '',
    });

    const validate = () => {
        try {
            ownerInfoSchema.parse(ownerInfo);
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                console.log(err.issues);
            }
            return false;
        }
    };

    return {
        ownerInfo,
        setOwnerInfo,
        validate,
    };
};
