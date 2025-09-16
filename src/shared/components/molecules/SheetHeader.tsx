const SheetHeader = ({
    title,
    onClose,
    onPrimary,
    primaryLabel = '저장',
}: {
    title: string;
    onClose: () => void;
    onPrimary?: () => void;
    primaryLabel?: string;
}) => {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold">{title}</h2>
            <div className="flex items-center gap-3">
                <button className="text-gray-400 font-medium" onClick={onClose}>
                    닫기
                </button>
                {onPrimary && (
                    <button className="text-red-400 font-medium" onClick={onPrimary}>
                        {primaryLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SheetHeader;
