import { z } from 'zod';

export const petInfoSchema = z.object({
    name: z.string().min(1, '이름을 입력해주세요'),
    gender: z.enum(['male', 'female']),
    birthDate: z.string().optional(),
    adoptionDate: z.string().optional(),
    breed: z.string().min(1, '품종을 선택해주세요'),
    weight: z.string().min(1, '몸무게를 입력해주세요'),
    isNeutered: z.boolean().nullable(),
    photo: z.string().optional(),
});

export type PetInfoData = z.infer<typeof petInfoSchema> & {
    id: string;
};
