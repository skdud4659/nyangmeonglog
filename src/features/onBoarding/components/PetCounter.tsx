import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import { motion } from 'framer-motion';

interface PetCounterProps {
    label: string;
    count: number;
    onChange: (count: number) => void;
    maxCount?: number;
}

const PetCounter = ({ label, count, onChange, maxCount = 4 }: PetCounterProps) => (
    <div className="flex flex-col items-center gap-3">
        <span className="font-medium text-gray_7 text-sm">{label}</span>
        <div className="flex flex-col rounded-full p-8 shadow-sm border border-primary">
            {label === '강아지' ? (
                <DogIcon width={58} height={58} />
            ) : (
                <CatIcon width={58} height={58} />
            )}
        </div>
        <div className="flex items-center space-x-4">
            <motion.button
                onClick={() => onChange(Math.max(0, count - 1))}
                className={`w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ${
                    count === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileTap={{ scale: 0.9 }}
            >
                -
            </motion.button>
            <span className="text-lg font-bold">{count}</span>
            <motion.button
                onClick={() => onChange(Math.min(maxCount, count + 1))}
                className={`w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ${
                    count === maxCount ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileTap={{ scale: 0.9 }}
            >
                +
            </motion.button>
        </div>
    </div>
);

export default PetCounter;
