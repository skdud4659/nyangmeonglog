import { AnimatePresence, motion } from 'framer-motion';

const ConfirmModal = ({
    open,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) => (
    <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[1000] flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-black opacity-50" onClick={onCancel} />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative z-[1001] bg-white rounded-2xl p-5 w-80"
                >
                    <div className="text-center mb-4">정말로 산책을 끝내시겠어요?</div>
                    <div className="flex gap-2">
                        <button className="flex-1 h-11 rounded-full border" onClick={onCancel}>
                            더 할게요!
                        </button>
                        <button
                            className="flex-1 h-11 rounded-full bg-red-400 text-white"
                            onClick={onConfirm}
                        >
                            산책 끝!
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ConfirmModal;
