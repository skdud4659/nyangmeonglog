import { ownerInfoSchema, type OwnerInfoData } from '@/features/onBoarding/schemas/ownerInfoSchema';
import { useState } from 'react';

export const useOwnerInfo = () => {
    // 데이터 임시 입력
    const [ownerInfo, setOwnerInfo] = useState<OwnerInfoData>({
        name: '김냥이',
        photo: '',
    });

    const validate = () => {
        ownerInfoSchema.parse(ownerInfo);
    };

    return {
        ownerInfo,
        setOwnerInfo,
        validate,
    };
};
