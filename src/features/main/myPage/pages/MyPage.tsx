import PetInfo from '@/features/main/myPage/components/PetInfo';
import PetProfile from '@/features/main/myPage/components/PetProfile';
import { SettingsMenu } from '@/features/main/myPage/components/SettingsMenu';
import { useActivePet, usePetStore } from '@/shared/store/petStore';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

const MyPage = () => {
    const navigate = useNavigate();
    const loadPets = usePetStore(s => s.loadPetsForCurrentUser);
    const pets = usePetStore(s => s.pets);
    const setActivePetId = usePetStore(s => s.setActivePetId);
    const activePet = useActivePet();

    useEffect(() => {
        loadPets();
    }, [loadPets]);

    const handleAddPet = () => {
        navigate({ to: '/main/myPage/petForm' });
    };

    return (
        <div className="p-6">
            <PetProfile
                pets={pets}
                activePet={activePet}
                onSelectPet={setActivePetId}
                onAddPet={handleAddPet}
            />
            <PetInfo pet={activePet} />
            <SettingsMenu />
        </div>
    );
};

export default MyPage;
