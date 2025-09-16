import type { ScheduleCategory, ScheduleItem } from '@/features/main/schedule/api/schedulesApi';
import DentalBgIcon from '@/shared/assets/icons/dentalIcon.svg?react';
import InjectionBgIcon from '@/shared/assets/icons/injectionIcon.svg?react';
import Button from '@/shared/components/atoms/Button';
import { getDday } from '@/shared/lib/date';

const HeroCard = ({
    item,
    petName,
    category,
    onChangeClick,
    onCompleteClick,
}: {
    item: ScheduleItem;
    petName?: string;
    category: ScheduleCategory;
    onChangeClick: () => void;
    onCompleteClick: () => void;
}) => {
    const BgIcon = category === 'health' ? InjectionBgIcon : DentalBgIcon;
    const dday = getDday(item.date);
    return (
        <div className="px-6 mt-4">
            <div
                className="relative overflow-hidden rounded-3xl bg-[#F9FBFF]"
                style={{ boxShadow: '0px 2px 16px 0px rgba(202,202,202,0.35)' }}
            >
                <div className="absolute right-2 top-2 opacity-20">
                    <BgIcon className="w-36 h-36" />
                </div>
                <div className="pt-6 px-4 pb-3">
                    <span className="text-sm font-extrabold bg-[#E8F0FF] text-[#3A6FF8] rounded-full px-3 py-1">
                        {dday}
                    </span>
                    <div className="mt-3">
                        <p className="text-body1-bold text-gray_9">
                            {petName ? `${petName} - ${item.title}` : item.title}까지
                            <br />
                            <span className="text-[#3A6FF8]">{dday.replace('D-', '')}일 </span>
                            <span>남았어요</span>
                        </p>
                    </div>
                    {item.location && (
                        <div className="mt-3 text-label text-gray_6">접종병원: {item.location}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 py-2 mt-3 bg-white border border-[#F9F9F9] rounded-2xl font-bold text-xs">
                        <Button
                            label="일정변경"
                            variant="secondary"
                            onClick={onChangeClick}
                            className="text-[#2E57E7]"
                        />
                        <Button
                            label="완료했어요"
                            onClick={onCompleteClick}
                            variant="secondary"
                            className="text-[#EB4040]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroCard;
