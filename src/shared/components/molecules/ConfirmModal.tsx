import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmModal = ({
    open,
    title = '확인하시겠어요?',
    confirmLabel = '확인',
    cancelLabel = '취소',
    onCancel,
    onConfirm,
}: ConfirmModalProps) => (
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
                    <div className="text-center mb-4">{title}</div>
                    <div className="flex gap-2">
                        <button className="flex-1 h-11 rounded-full border" onClick={onCancel}>
                            {cancelLabel}
                        </button>
                        <button
                            className="flex-1 h-11 rounded-full bg-red-400 text-white"
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ConfirmModal;
