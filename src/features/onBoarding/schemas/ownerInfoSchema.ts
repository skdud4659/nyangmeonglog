import { z } from 'zod';

export const ownerInfoSchema = z.object({
    name: z.string().min(1, '이름을 입력해주세요'),
    photo: z.string().optional(),
});

export type OwnerInfoData = z.infer<typeof ownerInfoSchema>;
