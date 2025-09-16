import { updatePet as updatePetApi } from '@/features/main/home/api/petsApi';
import { insertPet } from '@/features/onBoarding/api/onboardingApi';
import StepPetDetails from '@/features/onBoarding/components/StepPetDetails';
import type { PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';
import Button from '@/shared/components/atoms/Button';
import TopNavigation from '@/shared/components/molecules/TopNavigation';
import { useActivePet } from '@/shared/store/petStore';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

const PetFormPage = () => {
    const navigate = useNavigate();
    const activePet = useActivePet();
    const toFormGender = (g?: 'male' | 'female' | 'unknown' | null): 'male' | 'female' =>
        g === 'female' ? 'female' : 'male';
    const [species, setSpecies] = useState<'dog' | 'cat'>(activePet?.species ?? 'dog');
    const [pet, setPet] = useState<PetInfoData>({
        id: 'dog-0',
        name: activePet?.name ?? '',
        gender: toFormGender(activePet?.gender as 'male' | 'female' | 'unknown' | null),
        birthDate: activePet?.birthdate ?? '',
        adoptionDate: activePet?.adoptionDate ?? '',
        breed: activePet?.breed ?? '',
        weight: typeof activePet?.weightKg === 'number' ? String(activePet?.weightKg) : '',
        isNeutered: null,
        photo: activePet?.photoUrl ?? undefined,
    });

    useEffect(() => {
        if (!activePet) return;
        setSpecies(activePet.species);
        setPet(prev => ({
            ...prev,
            id: `${activePet.species}-0`,
            name: activePet.name,
            gender: toFormGender(activePet.gender as 'male' | 'female' | 'unknown' | null),
            birthDate: activePet.birthdate ?? '',
            adoptionDate: activePet.adoptionDate ?? '',
            breed: activePet.breed ?? '',
            weight: typeof activePet.weightKg === 'number' ? String(activePet.weightKg) : '',
            photo: activePet.photoUrl ?? undefined,
        }));
    }, [activePet]);

    const updatePetForm = (updates: Partial<PetInfoData>) => {
        setPet(prev => ({ ...prev, ...updates }));
    };

    const switchSpecies = (next: 'dog' | 'cat') => {
        setSpecies(next);
        setPet(prev => ({ ...prev, id: `${next}-0` }));
    };

    const isEdit = useMemo(() => !!activePet?.id, [activePet]);

    const handleSave = async () => {
        if (isEdit && activePet) {
            await updatePetApi(activePet.id, {
                name: pet.name,
                species,
                gender: pet.gender as 'male' | 'female' | 'unknown',
                breed: pet.breed,
                birthdate: pet.birthDate || null,
                adoption_date: pet.adoptionDate || null,
                weight_kg: isNaN(parseFloat(pet.weight)) ? null : parseFloat(pet.weight),
                neutered: pet.isNeutered,
                photo: pet.photo ?? null,
            });
        } else {
            await insertPet({
                name: pet.name,
                species,
                gender: pet.gender,
                breed: pet.breed,
                birthdate: pet.birthDate || undefined,
                adoption_date: pet.adoptionDate || undefined,
                weight_kg: isNaN(parseFloat(pet.weight)) ? undefined : parseFloat(pet.weight),
                neutered: pet.isNeutered,
                photo_data_url: pet.photo,
            });
        }
        navigate({ to: '/main/myPage' });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <TopNavigation onBack={() => navigate({ to: '/main/myPage' })} />
            <main className="flex flex-col flex-1 pt-14 px-6 pb-3 gap-8">
                <div className="flex items-center gap-2">
                    <button
                        className={`px-3 py-1 rounded-full text-sm border ${
                            species === 'dog'
                                ? 'bg-[#F38E8E] text-white border-transparent'
                                : 'bg-white border-gray-300'
                        }`}
                        onClick={() => switchSpecies('dog')}
                    >
                        강아지
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-sm border ${
                            species === 'cat'
                                ? 'bg-[#F38E8E] text-white border-transparent'
                                : 'bg-white border-gray-300'
                        }`}
                        onClick={() => switchSpecies('cat')}
                    >
                        고양이
                    </button>
                </div>

                <StepPetDetails pet={pet} updatePet={updatePetForm} index={0} />

                <div className="pt-4">
                    <Button type="button" label="저장" onClick={handleSave} />
                </div>
            </main>
        </div>
    );
};

export default PetFormPage;
