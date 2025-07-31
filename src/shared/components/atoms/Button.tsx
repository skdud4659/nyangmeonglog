import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = {
    label: string;
    variant?: 'primary' | 'secondary';
} & ButtonHTMLAttributes<HTMLButtonElement> &
    MotionProps;

const Button = ({ label, variant = 'primary', ...props }: ButtonProps) => {
    const baseStyle =
        'w-full py-3 rounded-full text-sm font-bold transition-colors disabled:opacity-50';
    const variantStyle =
        variant === 'primary'
            ? 'bg-primary text-white hover:bg-primary/80'
            : 'bg-transparent border border-gray_3 text-gray_3 hover:bg-gray_3/10';

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`${baseStyle} ${variantStyle}`}
            {...props}
        >
            {label}
        </motion.button>
    );
};

export default Button;
