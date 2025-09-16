import { ChevronLeft } from 'lucide-react';

type Props = {
    title?: string;
    onBack?: () => void;
    children?: React.ReactNode;
};

const TopNavigation = ({ title, onBack, children }: Props) => {
    return (
        <div className="absolute inset-x-0 top-7 z-10">
            {/* 배경 레이어: 상단 상태바 영역 포함해서 흰 배경만 깔기 */}
            <div className={`pointer-events-none absolute inset-x-0 -top-7 h-12 bg-white z-0`} />
            <div className="flex items-center relative z-10">
                <button
                    type="button"
                    onClick={onBack || (() => window.history.back())}
                    className="absolute pl-4 text-gray_7 hover:text-gray_9 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                {title && <h1 className="ml-4 text-lg font-bold">{title}</h1>}
                {children}
            </div>
        </div>
    );
};

export default TopNavigation;
