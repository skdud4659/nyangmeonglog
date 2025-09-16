import { supabase } from '@/shared/lib/supabase';

export type WalkPathPoint = { lat: number; lng: number };

export type WalkItem = {
    id: string;
    userId: string;
    petId: string;
    startedAt: string; // ISO
    endedAt: string; // ISO
    durationSec: number;
    distanceM: number;
    path: WalkPathPoint[];
    photos: string[];
    note?: string;
};

type WalkRow = {
    id: string;
    user_id: string;
    pet_id: string;
    started_at: string;
    ended_at: string;
    duration_sec: number;
    distance_m: number;
    path: unknown;
    photos?: unknown;
    note?: string | null;
};

const mapRow = (row: WalkRow): WalkItem => ({
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSec: row.duration_sec,
    distanceM: Number(row.distance_m ?? 0),
    path: (row.path as WalkPathPoint[]) ?? [],
    photos: (row.photos as string[]) ?? [],
    note: row.note ?? undefined,
});

export async function createWalk(input: {
    userId: string;
    petId: string;
    startedAt: string;
    endedAt: string;
    durationSec: number;
    distanceM: number;
    path: WalkPathPoint[];
    photos?: string[];
    note?: string;
}): Promise<WalkItem> {
    const payload = {
        user_id: input.userId,
        pet_id: input.petId,
        started_at: input.startedAt,
        ended_at: input.endedAt,
        duration_sec: input.durationSec,
        distance_m: input.distanceM,
        path: input.path,
        photos: input.photos ?? [],
        note: input.note ?? null,
    };
    const { data, error } = await supabase.from('walks').insert(payload).select('*').single();
    if (error) throw error;
    return mapRow(data as WalkRow);
}

export async function listWalks(params: {
    userId: string;
    petId?: string;
    year?: number;
    month?: number; // 0-indexed
}): Promise<WalkItem[]> {
    const { userId, petId, year, month } = params;
    let query = supabase
        .from('walks')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
    if (petId) query = query.eq('pet_id', petId);
    if (typeof year === 'number' && typeof month === 'number') {
        const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = new Date(year, month + 1, 0);
        const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        query = query.gte('started_at', start).lte('started_at', end);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as WalkRow[]).map(mapRow);
}

export async function getWalkById(id: string): Promise<WalkItem> {
    const { data, error } = await supabase.from('walks').select('*').eq('id', id).single();
    if (error) throw error;
    return mapRow(data as WalkRow);
}
