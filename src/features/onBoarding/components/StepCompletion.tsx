import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import { motion } from 'framer-motion';
import { PawPrintIcon } from 'lucide-react';
import { useMemo } from 'react';

const PAW_COUNT = 12;
const MIN_DISTANCE = 100;

interface CompletionPageProps {
    pets: { id: string; name: string; photo?: string }[];
}

const generateNonOverlappingPositions = (count: number) => {
    type RawPosition = {
        leftPercent: number;
        topPercent: number;
        delay: number;
    };

    const positions: RawPosition[] = [];

    for (let i = 0; i < count; i++) {
        let position: RawPosition;
        let attempts = 0;
        do {
            position = {
                leftPercent: Math.random() * 80 + 10,
                topPercent: Math.random() * 70 + 10,
                delay: Math.random() * 2,
            };
            attempts++;
        } while (
            attempts < 50 &&
            positions.some(
                p =>
                    Math.hypot(
                        p.leftPercent - position.leftPercent,
                        p.topPercent - position.topPercent
                    ) < MIN_DISTANCE
            )
        );
        positions.push(position);
    }

    return positions.map(p => ({
        left: `${p.leftPercent}%`,
        top: `${p.topPercent}%`,
        delay: p.delay,
    }));
};

const CompletionPage = ({ pets }: CompletionPageProps) => {
    const pawColors = ['#F38E8E', '#FAF2AF'];

    const pawColorAssignments = useMemo(
        () =>
            Array.from(
                { length: PAW_COUNT },
                () => pawColors[Math.floor(Math.random() * pawColors.length)]
            ),
        []
    );

    const positions = useMemo(() => generateNonOverlappingPositions(PAW_COUNT), []);

    const mainPet = pets[0];
    const otherPets = pets.slice(1, 3);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 mt-8 text-center">
                반가워요!
                <br />
                {pets.length > 1 ? (
                    <span>이제 우리 아이들을</span>
                ) : (
                    <span>이제 우리 {pets[0].name}를</span>
                )}
                <br />
                돌보러 가볼까요?
            </h2>
            <div className="relative flex flex-col items-center justify-center min-h-[50vh]">
                {positions.map((pos, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: pos.left,
                            top: pos.top,
                        }}
                        animate={{
                            y: [0, -10, 0, 10, 0],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: 'mirror',
                            delay: pos.delay,
                        }}
                    >
                        {i % 2 === 0 ? (
                            <PawPrintIcon
                                className="w-6 h-6"
                                style={{ color: pawColorAssignments[i] }}
                            />
                        ) : (
                            <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: pawColorAssignments[i] }}
                            />
                        )}
                    </motion.div>
                ))}

                <motion.div
                    className="relative z-10 w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg"
                    animate={{
                        y: [0, -8, 0, 8, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: 'mirror',
                    }}
                >
                    {mainPet?.photo ? (
                        <img
                            src={mainPet.photo}
                            alt={mainPet.name}
                            className="w-full h-full object-cover"
                        />
                    ) : mainPet?.id.startsWith('dog') ? (
                        <DogIcon className="w-full h-full p-4 text-gray_7" />
                    ) : (
                        <CatIcon className="w-full h-full p-4 text-gray_7" />
                    )}
                </motion.div>

                {otherPets.map((pet, idx) => (
                    <motion.div
                        key={pet.id}
                        className={`absolute z-10 w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg`}
                        style={{
                            left: idx === 0 ? '20%' : '80%',
                            top: '60%',
                            transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                            y: [0, -8, 0, 8, 0],
                        }}
                        transition={{
                            duration: 4.5 + idx,
                            repeat: Infinity,
                            repeatType: 'mirror',
                        }}
                    >
                        {pet.photo ? (
                            <img
                                src={pet.photo}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                            />
                        ) : pet.id.startsWith('dog') ? (
                            <DogIcon className="w-full h-full p-4 text-gray_7" />
                        ) : (
                            <CatIcon className="w-full h-full p-4 text-gray_7" />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CompletionPage;
