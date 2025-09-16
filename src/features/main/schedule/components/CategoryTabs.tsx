import type { ScheduleCategory } from '@/features/main/schedule/api/schedulesApi';
import PawPrintIcon from '@/shared/assets/icons/pawPrintIcon.svg?react';

const CategoryTabs = ({
    active,
    onChange,
}: {
    active: ScheduleCategory;
    onChange: (c: ScheduleCategory) => void;
}) => {
    return (
        <div className="px-6 pt-6 flex justify-end">
            <div className="flex gap-6 items-center">
                {(
                    [
                        { key: 'health', label: '건강' },
                        { key: 'care', label: '케어' },
                    ] as const
                ).map(tab => {
                    const isActive = active === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onChange(tab.key)}
                            className="flex items-center gap-1"
                        >
                            {isActive && <PawPrintIcon className="w-6 h-6 text-gray_9" />}
                            <span className={`text-h4 ${isActive ? 'text-gray_9' : 'text-gray_3'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryTabs;
