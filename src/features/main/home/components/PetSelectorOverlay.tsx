import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';

interface PetSelectorOverlayProps {
    isOpen: boolean;
    pets: Array<{
        id: string;
        name: string;
        photoUrl?: string | null;
        species?: 'dog' | 'cat' | string | null;
    }>;
    onSelect: (petId: string) => void;
    onClose: () => void;
}

const PetSelectorOverlay = ({ isOpen, pets, onSelect, onClose }: PetSelectorOverlayProps) => {
    if (!isOpen) return null;
    return (
        <div
            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="flex flex-col items-center space-y-4"
                onClick={e => e.stopPropagation()}
            >
                {pets.map(pet => (
                    <button
                        key={pet.id}
                        className="w-20 h-20 rounded-full overflow-hidden bg-white"
                        onClick={() => onSelect(pet.id)}
                    >
                        {pet.photoUrl ? (
                            <img
                                src={pet.photoUrl}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                            />
                        ) : pet.species === 'dog' ? (
                            <DogIcon className="w-full h-full p-4 text-gray-400" />
                        ) : (
                            <CatIcon className="w-full h-full p-4 text-gray-400" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PetSelectorOverlay;
