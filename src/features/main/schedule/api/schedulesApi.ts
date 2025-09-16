import { supabase } from '@/shared/lib/supabase';

export type ScheduleCategory = 'health' | 'care';

export type DbScheduleRow = {
    id: string;
    user_id: string;
    pet_id?: string | null;
    category: ScheduleCategory;
    title: string;
    date: string; // YYYY-MM-DD
    location?: string | null;
    is_completed: boolean;
    notifications_enabled?: boolean | null;
    reminder_minutes?: number | null;
    created_at: string;
};

export type ScheduleItem = {
    id: string;
    petId: string | null;
    category: ScheduleCategory;
    title: string;
    date: string;
    location?: string;
    isCompleted: boolean;
    notificationsEnabled: boolean;
    reminderMinutes: number;
};

const mapRowToItem = (row: DbScheduleRow): ScheduleItem => ({
    id: row.id,
    petId: row.pet_id ?? null,
    category: row.category,
    title: row.title,
    date: row.date,
    location: row.location ?? undefined,
    isCompleted: !!row.is_completed,
    notificationsEnabled: !!row.notifications_enabled,
    reminderMinutes: typeof row.reminder_minutes === 'number' ? row.reminder_minutes : 60,
});

export async function listSchedules(params: {
    userId: string;
    category?: ScheduleCategory;
    petId?: string | null;
}): Promise<ScheduleItem[]> {
    const { userId, category } = params;

    let query = supabase
        .from('schedules')
        .select(
            'id, user_id, pet_id, category, title, date, location, is_completed, notifications_enabled, reminder_minutes, created_at'
        )
        .eq('user_id', userId)
        .order('date', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    if (typeof params.petId !== 'undefined' && params.petId !== null) {
        query = query.eq('pet_id', params.petId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapRowToItem);
}

export async function markScheduleCompleted(id: string, completed: boolean): Promise<void> {
    const { error } = await supabase
        .from('schedules')
        .update({ is_completed: completed })
        .eq('id', id);
    if (error) throw error;
}

export async function createSchedule(input: {
    userId: string;
    petId: string | null;
    category: ScheduleCategory;
    title: string;
    date: string; // YYYY-MM-DD
    location?: string;
    notificationsEnabled?: boolean;
    reminderMinutes?: number;
}): Promise<ScheduleItem> {
    const payload = {
        user_id: input.userId,
        pet_id: input.petId ?? null,
        category: input.category,
        title: input.title,
        date: input.date,
        location: input.location ?? null,
        is_completed: false,
        notifications_enabled: input.notificationsEnabled ?? true,
        reminder_minutes: input.reminderMinutes ?? 60,
    };
    const { data, error } = await supabase
        .from('schedules')
        .insert(payload)
        .select(
            'id, user_id, pet_id, category, title, date, location, is_completed, notifications_enabled, reminder_minutes, created_at'
        )
        .single();
    if (error) throw error;
    return mapRowToItem(data as DbScheduleRow);
}

export async function updateSchedule(
    id: string,
    input: {
        title?: string;
        petId?: string | null;
        category?: ScheduleCategory;
        date?: string; // YYYY-MM-DD
        location?: string;
        notificationsEnabled?: boolean;
        reminderMinutes?: number;
        isCompleted?: boolean;
    }
): Promise<ScheduleItem> {
    const payload: Partial<DbScheduleRow> = {};
    if (typeof input.title !== 'undefined') payload.title = input.title;
    if (typeof input.petId !== 'undefined') (payload as any).pet_id = input.petId;
    if (typeof input.category !== 'undefined') payload.category = input.category;
    if (typeof input.date !== 'undefined') payload.date = input.date;
    if (typeof input.location !== 'undefined') payload.location = input.location ?? null;
    if (typeof input.notificationsEnabled !== 'undefined')
        payload.notifications_enabled = input.notificationsEnabled;
    if (typeof input.reminderMinutes !== 'undefined')
        payload.reminder_minutes = input.reminderMinutes;
    if (typeof input.isCompleted !== 'undefined') payload.is_completed = input.isCompleted;

    const { data, error } = await supabase
        .from('schedules')
        .update(payload)
        .eq('id', id)
        .select(
            'id, user_id, pet_id, category, title, date, location, is_completed, notifications_enabled, reminder_minutes, created_at'
        )
        .single();
    if (error) throw error;
    return mapRowToItem(data as DbScheduleRow);
}

export async function deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
}
