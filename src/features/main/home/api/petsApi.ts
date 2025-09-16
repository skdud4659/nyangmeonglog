import { supabase } from '@/shared/lib/supabase';

export type PetItem = {
    id: string;
    name: string;
    species: 'dog' | 'cat';
    photoUrl?: string | null;
    breed?: string | null;
    gender?: 'male' | 'female' | 'unknown' | null;
    birthdate?: string | null; // YYYY-MM-DD
    adoptionDate?: string | null; // YYYY-MM-DD
    weightKg?: number | null;
    supplements?: string[];
};

type DbPetRow = {
    id: string;
    name: string;
    species: 'dog' | 'cat';
    photo_url?: string | null;
    breed?: string | null;
    gender?: 'male' | 'female' | 'unknown' | null;
    birthdate?: string | null;
    adoption_date?: string | null;
    weight_kg?: number | null;
    supplements?: unknown;
};

const mapRowToItem = (row: DbPetRow): PetItem => ({
    id: row.id,
    name: row.name,
    species: row.species,
    photoUrl: row.photo_url ?? null,
    breed: row.breed ?? null,
    gender: row.gender ?? null,
    birthdate: row.birthdate ?? null,
    adoptionDate: row.adoption_date ?? null,
    weightKg: typeof row.weight_kg === 'number' ? row.weight_kg : null,
    supplements: (row.supplements as string[] | undefined) ?? [],
});

export async function getUserPets(userId: string): Promise<PetItem[]> {
    const { data, error } = await supabase
        .from('pets')
        .select(
            'id, name, species, photo_url, breed, gender, birthdate, adoption_date, weight_kg, supplements'
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(mapRowToItem);
}

export async function getPetById(petId: string): Promise<PetItem | null> {
    const { data, error } = await supabase
        .from('pets')
        .select(
            'id, name, species, photo_url, breed, gender, birthdate, adoption_date, weight_kg, supplements'
        )
        .eq('id', petId)
        .maybeSingle();
    if (error) throw error;
    return data ? mapRowToItem(data as DbPetRow) : null;
}

const uploadDataUrlToStorage = async (dataUrl: string): Promise<string> => {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) throw new Error('잘못된 이미지 데이터 형식입니다.');
    const mimeType = match[1];
    const base64Data = match[2];
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('로그인이 필요합니다.');
    const userId = userData.user.id;
    const fileExt = mimeType.split('/')[1] || 'png';
    const path = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(path, blob, { upsert: false, contentType: mimeType });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('pet-photos').getPublicUrl(path);
    return data.publicUrl;
};

export async function updatePet(
    id: string,
    input: {
        name?: string;
        species?: 'dog' | 'cat';
        breed?: string;
        gender?: 'male' | 'female' | 'unknown';
        birthdate?: string | null;
        adoption_date?: string | null;
        weight_kg?: number | null;
        neutered?: boolean | null;
        photo?: string | null; // data URL or existing url
        supplements?: string[];
    }
): Promise<void> {
    const payload: Partial<DbPetRow> = {};
    if (typeof input.name !== 'undefined') payload.name = input.name;
    if (typeof input.species !== 'undefined') payload.species = input.species;
    if (typeof input.breed !== 'undefined') payload.breed = input.breed;
    if (typeof input.gender !== 'undefined') payload.gender = input.gender;
    if (typeof input.birthdate !== 'undefined') payload.birthdate = input.birthdate ?? null;
    if (typeof input.adoption_date !== 'undefined')
        payload.adoption_date = input.adoption_date ?? null;
    if (typeof input.weight_kg !== 'undefined') payload.weight_kg = input.weight_kg ?? null;
    if (typeof input.neutered !== 'undefined') payload.neutered = input.neutered ?? null;
    if (typeof input.supplements !== 'undefined') (payload as any).supplements = input.supplements;

    if (typeof input.photo !== 'undefined' && input.photo) {
        if (input.photo.startsWith('data:')) {
            try {
                payload.photo_url = await uploadDataUrlToStorage(input.photo);
            } catch (e) {
                console.warn('사진 업로드 실패:', e);
            }
        } else {
            payload.photo_url = input.photo;
        }
    } else if (input.photo === null) {
        payload.photo_url = null;
    }

    const { error } = await supabase.from('pets').update(payload).eq('id', id);
    if (error) throw error;
}
