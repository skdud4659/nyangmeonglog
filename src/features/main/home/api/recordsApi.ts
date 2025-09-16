import type { SimpleRecord } from '@/features/main/home/types/record';
import { supabase } from '@/shared/lib/supabase';

export type UpsertSimpleRecordInput = {
    userId: string;
    petId: string;
    date: string; // YYYY-MM-DD
    food: boolean;
    water: boolean;
    snack: boolean;
    poop: boolean;
    pee: boolean;
    supplements?: string[]; // 복용한 영양제 목록
    extras?: { brush: boolean; bath: boolean; grooming: boolean };
    health?: {
        spasm?: { note?: string; photoUrl?: string | null };
        vaccination?: { note?: string; photoUrl?: string | null };
        checkup?: { note?: string; photoUrl?: string | null };
    };
};

type SimpleRecordRow = {
    id: string;
    user_id: string;
    pet_id: string;
    date: string;
    mode: 'simple' | 'detail';
    food: boolean;
    water: boolean;
    snack: boolean;
    poop: boolean;
    pee: boolean;
    supplements?: unknown; // jsonb: string[]
    extras?: unknown;
    health?: unknown;
    created_at?: string;
    updated_at?: string;
};

const mapRowToSimpleRecord = (row: SimpleRecordRow): SimpleRecord => ({
    id: row.id,
    date: row.date,
    petId: row.pet_id,
    food: row.food,
    water: row.water,
    snack: row.snack,
    poop: row.poop,
    pee: row.pee,
    supplements: (row.supplements as string[] | undefined) ?? [],
    extras: (row.extras as SimpleRecord['extras'] | undefined) ?? {
        brush: false,
        bath: false,
        grooming: false,
    },
    health: (row.health as SimpleRecord['health'] | undefined) ?? {},
});

export async function upsertSimpleRecord(input: UpsertSimpleRecordInput): Promise<SimpleRecord> {
    const {
        userId,
        petId,
        date,
        food,
        water,
        snack,
        poop,
        pee,
        supplements = [],
        extras,
        health,
    } = input;
    const { data, error } = await supabase
        .from('records')
        .upsert(
            [
                {
                    user_id: userId,
                    pet_id: petId,
                    date,
                    mode: 'simple',
                    food,
                    water,
                    snack,
                    poop,
                    pee,
                    supplements,
                    extras,
                    health,
                },
            ],
            { onConflict: 'user_id,pet_id,date' }
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    return mapRowToSimpleRecord(data as SimpleRecordRow);
}

export async function getSimpleRecordsForMonth(params: {
    userId: string;
    petId: string;
    year: number;
    month: number; // 0-indexed (0-11)
}): Promise<SimpleRecord[]> {
    const { userId, petId, year, month } = params;
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .eq('mode', 'simple')
        .gte('date', startDate)
        .lte('date', endDateStr);

    if (error) {
        throw error;
    }

    return (data as SimpleRecordRow[]).map(mapRowToSimpleRecord);
}
