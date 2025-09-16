import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RecordFormSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const RecordFormSheet = ({ isOpen, onClose, children }: RecordFormSheetProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 z-40 max-w-md mx-auto"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-lg max-w-md mx-auto"
                        style={{ height: '95%' }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RecordFormSheet;
