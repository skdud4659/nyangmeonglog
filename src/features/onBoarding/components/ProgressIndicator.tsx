import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => (
    <div className="flex items-center justify-center flex-1 space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
            <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: i === currentStep ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
            />
        ))}
    </div>
);

export default ProgressIndicator;
