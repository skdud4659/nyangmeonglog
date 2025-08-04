import { ChevronLeft } from 'lucide-react';

type Props = {
    title?: string;
    onBack?: () => void;
    children?: React.ReactNode;
};

const TopNavigation = ({ title, onBack, children }: Props) => {
    return (
        <div className="absolute w-full top-7 flex items-center">
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
    );
};

export default TopNavigation;
