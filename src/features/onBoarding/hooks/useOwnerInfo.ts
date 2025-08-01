import { ownerInfoSchema, type OwnerInfoData } from '@/features/onBoarding/schemas/ownerInfoSchema';
import { useState } from 'react';
import { z } from 'zod';

export const useOwnerInfo = () => {
    // 데이터 임시 입력
    const [ownerInfo, setOwnerInfo] = useState<OwnerInfoData>({
        name: '김냥이',
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
