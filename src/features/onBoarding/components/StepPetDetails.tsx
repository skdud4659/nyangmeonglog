import BreedDropdown from '@/features/onBoarding/components/BreedDropdown';
import GenderSelection from '@/features/onBoarding/components/GenderSelection';
import type { PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import InputField from '@/shared/components/molecules/InputField';
import PhotoUpload from '@/shared/components/molecules/PhotoUpload';

interface StepPetDetailsProps {
    pet: PetInfoData;
    updatePet: (updates: Partial<PetInfoData>) => void;
    index: number;
}

const StepPetDetails = ({ pet, updatePet, index }: StepPetDetailsProps) => {
    return (
        <div className="flex flex-col gap-10">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                {pet.id.startsWith('dog') ? (
                    <DogIcon width={30} height={30} />
                ) : (
                    <CatIcon width={30} height={30} />
                )}
                #{index + 1} 정보를 입력해주세요
            </h1>
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-8">
                    <PhotoUpload photo={pet.photo} onPhotoChange={photo => updatePet({ photo })} />
                    <InputField
                        label="이름"
                        value={pet.name}
                        onClear={() => updatePet({ name: '' })}
                        onChange={e => updatePet({ name: e.target.value })}
                    />
                </div>
                <GenderSelection value={pet.gender} onChange={gender => updatePet({ gender })} />
                <InputField
                    label="태어난 날"
                    type="date"
                    value={pet.birthDate || ''}
                    onChange={e => updatePet({ birthDate: e.target.value })}
                    showClearButton={false}
                />
                <InputField
                    label="나와 함께하기 시작한 날"
                    type="date"
                    value={pet.adoptionDate || ''}
                    onChange={e => updatePet({ adoptionDate: e.target.value })}
                    showClearButton={false}
                />
                <BreedDropdown
                    value={pet.breed}
                    onChange={breed => updatePet({ breed })}
                    petType={pet.id.startsWith('dog') ? 'dog' : 'cat'}
                />
                <InputField
                    label="몸무게"
                    type="number"
                    value={pet.weight || ''}
                    onClear={() => updatePet({ weight: '' })}
                    onChange={e => updatePet({ weight: e.target.value })}
                />
            </div>
        </div>
    );
};

export default StepPetDetails;
