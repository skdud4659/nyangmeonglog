import { z } from 'zod';

export const petCountSchema = z
    .object({
        dogs: z.number().min(0).max(4),
        cats: z.number().min(0).max(4),
    })
    .refine(data => data.dogs + data.cats <= 4, {
        message: '총 마릿수는 4마리를 초과할 수 없습니다',
    })
    .refine(data => data.dogs + data.cats >= 1, {
        message: '최소 1마리는 선택해야 합니다',
    });

export type PetCountData = z.infer<typeof petCountSchema>;
