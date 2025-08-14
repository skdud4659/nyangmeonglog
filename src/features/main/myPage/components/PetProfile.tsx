import { motion } from 'framer-motion';

const PetProfile = ({ pet }: any) => {
    return (
        <div className="flex flex-col items-center">
            {/* 동료 반려동물 */}
            <div className="flex space-x-2 mb-2">
                {pet.companions.map((companion: any) => (
                    <div
                        key={companion.id}
                        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow"
                    >
                        <img
                            src={companion.photo}
                            alt="companion"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* 메인 반려동물 프로필 */}
            <motion.div
                className="w-36 h-36 rounded-full border-4 border-[#F38E8E] overflow-hidden shadow-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
            </motion.div>

            {/* 이름 & 함께한 날짜 */}
            <p className="mt-4 font-bold text-lg">
                {pet.name}와 함께한지 {calcDaysTogether(pet.birth)}일째
            </p>
        </div>
    );
};

const calcDaysTogether = (birth: string) => {
    const start = new Date(birth);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
};

export default PetProfile;
