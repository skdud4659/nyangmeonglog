import { supabase } from '@/shared/lib/supabase';

export type PetItem = {
    id: string;
    name: string;
    species: 'dog' | 'cat';
    photo_url?: string | null;
};

export async function getUserPets(userId: string): Promise<PetItem[]> {
    const { data, error } = await supabase
        .from('pets')
        .select('id, name, species, photo_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []) as PetItem[];
}
