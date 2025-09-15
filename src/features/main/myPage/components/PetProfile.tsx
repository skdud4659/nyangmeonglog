import type { PetItem } from '@/features/main/home/api/petsApi';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

type PetProfileProps = {
    pets: PetItem[];
    activePet?: PetItem;
    onSelectPet: (petId: string) => void;
    onAddPet: () => void;
};

const PetProfile = ({ pets, activePet, onSelectPet, onAddPet }: PetProfileProps) => {
    const companions = pets.filter(p => p.id !== (activePet?.id ?? ''));
    const today = new Date();
    const adoptionDate = activePet?.adoptionDate ? new Date(activePet.adoptionDate) : undefined;
    const daysTogether = adoptionDate
        ? Math.floor((today.getTime() - adoptionDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="flex flex-col items-center">
            {/* 동료 반려동물 */}
            <div className="flex space-x-2 mb-2">
                {companions.map(c => (
                    <button
                        key={c.id}
                        onClick={() => onSelectPet(c.id)}
                        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow"
                    >
                        {c.photoUrl ? (
                            <img
                                src={c.photoUrl}
                                alt={c.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-gray-500">{c.name.slice(0, 2)}</span>
                        )}
                    </button>
                ))}
                {pets.length < 4 && (
                    <button
                        aria-label="add-pet"
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow"
                        onClick={onAddPet}
                    >
                        <Plus className="text-gray-400" size={18} />
                    </button>
                )}
            </div>

            {/* 메인 반려동물 프로필 */}
            <motion.div
                className="w-36 h-36 rounded-full border-4 border-[#F38E8E] overflow-hidden shadow-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                {activePet?.photoUrl ? (
                    <img
                        src={activePet.photoUrl}
                        alt={activePet.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                        없음
                    </div>
                )}
            </motion.div>

            {/* 오늘 날짜 */}
            <p className="mt-3 text-xs text-gray-500">{today.toLocaleDateString()}</p>

            {/* 이름 & 함께한 날짜 */}
            <p className="mt-1 font-bold text-lg">
                {activePet
                    ? `${activePet.name}와 함께한지 ${daysTogether}일째`
                    : '반려동물을 추가해주세요'}
            </p>
        </div>
    );
};

export default PetProfile;
