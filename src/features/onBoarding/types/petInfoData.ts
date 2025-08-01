import type { PetInfoData as PetInfoDataSchema } from '@/features/onBoarding/schemas/petInfoSchema';

export type PetInfoData = PetInfoDataSchema & {
    id: string; // UI 식별자
};
