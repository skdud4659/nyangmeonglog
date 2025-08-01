import { z } from 'zod';

export const modeSelectionSchema = z
    .object({
        mode: z.enum(['simple', 'detail']),
    })
    .refine(data => data.mode === 'simple' || data.mode === 'detail', {
        message: '하나의 모드를 선택해주세요',
    });

export type ModeSelectionData = z.infer<typeof modeSelectionSchema>;
