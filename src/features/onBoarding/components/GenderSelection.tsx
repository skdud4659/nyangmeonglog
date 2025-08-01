import { motion } from 'framer-motion';

interface GenderSelectionProps {
    value: 'male' | 'female' | '';
    onChange: (gender: 'male' | 'female') => void;
}

const GenderSelection = ({ value, onChange }: GenderSelectionProps) => (
    <div>
        <label className="block text-sm font-medium text-gray_7 mb-3">성별</label>
        <div className="flex space-x-3">
            {[
                { value: 'male', label: '남아' },
                { value: 'female', label: '여아' },
            ].map(option => (
                <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value as 'male' | 'female')}
                    className={`flex-1 py-4 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                        value === option.value
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-xl">{option.emoji}</span>
                    <span>{option.label}</span>
                </motion.button>
            ))}
        </div>
    </div>
);

export default GenderSelection;
