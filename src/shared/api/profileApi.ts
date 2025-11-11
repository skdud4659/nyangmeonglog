import { supabase } from '@/shared/lib/supabase';

export async function getActivePetId(): Promise<string | null> {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('active_pet_id')
        .eq('id', uid)
        .maybeSingle();
    if (error) throw error;
    return (data?.active_pet_id as string | null) ?? null;
}

export async function setActivePetId(petId: string | null): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: uid, active_pet_id: petId }, { onConflict: 'id' });
    if (error) throw error;
}
