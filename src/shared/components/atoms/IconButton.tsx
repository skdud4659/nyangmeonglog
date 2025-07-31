import { motion, type MotionProps } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = {
    icon: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
    MotionProps;

const IconButton = ({ icon, ...props }: IconButtonProps) => {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            className="rounded-full hover:bg-gray_2 transition-colors"
            {...props}
        >
            {icon}
        </motion.button>
    );
};

export default IconButton;
