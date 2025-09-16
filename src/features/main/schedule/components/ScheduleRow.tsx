import type { ScheduleItem } from '@/features/main/schedule/api/schedulesApi';
import { formatDateKorean, getDday } from '@/features/main/schedule/lib/date';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';
import IconButton from '@/shared/components/atoms/IconButton';
import { MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ScheduleRow = ({
    item,
    petName,
    petPhotoUrl,
    petSpecies,
    onEdit,
    onDelete,
}: {
    item: ScheduleItem;
    petName?: string;
    petPhotoUrl?: string | null;
    petSpecies?: 'dog' | 'cat';
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const dday = getDday(item.date);
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const handleDown = (e: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDown);
        return () => document.removeEventListener('mousedown', handleDown);
    }, [open]);
    return (
        <div
            className="flex items-center justify-between bg-white rounded-2xl px-4 py-[6px] shadow-sm relative"
            style={{ boxShadow: '0px 1px 13px 0px rgba(202,202,202,0.25)' }}
        >
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray_7 bg-gray-100 rounded-full px-3 py-1">
                    {dday}
                </span>
                <div className="flex flex-col">
                    <span className="text-label text-gray_5">{formatDateKorean(item.date)}</span>
                    <span className="text-body2-bold text-gray_9">{item.title}</span>
                    {petName && (
                        <span className="text-xs text-gray_5 flex items-center gap-1 mt-0.5">
                            {petPhotoUrl ? (
                                <img
                                    src={petPhotoUrl}
                                    alt={petName}
                                    className="w-4 h-4 rounded-full object-cover border border-gray-200"
                                />
                            ) : petSpecies === 'dog' ? (
                                <DogIcon className="w-4 h-4 text-gray_5" />
                            ) : (
                                <CatIcon className="w-4 h-4 text-gray_5" />
                            )}
                            <span>{petName}</span>
                        </span>
                    )}
                </div>
            </div>
            <div ref={menuRef}>
                <IconButton
                    onClick={() => setOpen(o => !o)}
                    icon={<MoreVertical size={18} className="text-gray_5" />}
                />
                {open && (
                    <div className="absolute right-2 top-12 bg-white border rounded-xl shadow-lg z-10 min-w-[120px]">
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-body2"
                            onClick={() => {
                                setOpen(false);
                                onEdit(item.id);
                            }}
                        >
                            변경
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-error text-body2"
                            onClick={() => {
                                setOpen(false);
                                onDelete(item.id);
                            }}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleRow;
