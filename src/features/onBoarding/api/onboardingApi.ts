import { supabase } from '@/shared/lib/supabase';

export type OnboardingMode = 'simple' | 'detail';

export interface PetInsertPayload {
    name: string;
    species: 'dog' | 'cat';
    gender: 'male' | 'female' | 'unknown';
    breed: string;
    birthdate?: string;
    adoption_date?: string;
    weight_kg?: number;
    neutered?: boolean | null;
    photo_data_url?: string;
}

const getUserIdOrThrow = async (): Promise<string> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('로그인이 필요합니다.');
    return data.user.id;
};

export const ensureProfile = async (): Promise<void> => {
    const userId = await getUserIdOrThrow();
    const { error } = await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' });
    if (error) throw error;
};

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

    const userId = await getUserIdOrThrow();
    const fileExt = mimeType.split('/')[1] || 'png';
    const path = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(path, blob, { upsert: false, contentType: mimeType });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('pet-photos').getPublicUrl(path);
    return data.publicUrl;
};

export const insertPet = async (pet: PetInsertPayload): Promise<string> => {
    const userId = await getUserIdOrThrow();
    await ensureProfile();

    let photo_url: string | undefined;
    if (pet.photo_data_url) {
        try {
            photo_url = await uploadDataUrlToStorage(pet.photo_data_url);
        } catch (e) {
            console.warn('사진 업로드 실패:', e);
        }
    }

    const { data, error } = await supabase
        .from('pets')
        .insert({
            user_id: userId,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            gender: pet.gender,
            birthdate: pet.birthdate,
            adoption_date: pet.adoption_date,
            weight_kg: pet.weight_kg,
            neutered: pet.neutered ?? null,
            photo_url,
        })
        .select('id')
        .single();
    if (error) throw error;
    return data.id as string;
};

export const finalizeOnboarding = async (params: {
    displayName?: string;
    mode?: OnboardingMode;
    photoDataUrl?: string;
}): Promise<void> => {
    const userId = await getUserIdOrThrow();
    await ensureProfile();
    const updates: Record<string, unknown> = { is_onboarded: true };
    if (params.displayName) updates.display_name = params.displayName;
    if (params.photoDataUrl) {
        try {
            const photoUrl = await uploadDataUrlToStorage(params.photoDataUrl);
            updates.photo_url = photoUrl;
        } catch (e) {
            console.warn('프로필 사진 업로드 실패:', e);
        }
    }
    if (params.mode) updates.mode = params.mode;
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
};
