import type { OwnerInfoData } from '@/features/onBoarding/schemas/ownerInfoSchema';
import InputField from '@/shared/components/molecules/InputField';
import PhotoUpload from '@/shared/components/molecules/PhotoUpload';

interface StepOwnerInfoProps {
    ownerInfo: OwnerInfoData;
    setOwnerInfo: (info: OwnerInfoData) => void;
}

const StepOwnerInfo = ({ ownerInfo, setOwnerInfo }: StepOwnerInfoProps) => {
    return (
        <div className="flex flex-col gap-32">
            <h1 className="text-3xl font-bold">
                집사님의 <br />
                정보를 입력해주세요!
            </h1>
            <div className="flex items-center justify-center gap-8">
                <PhotoUpload
                    photo={ownerInfo.photo}
                    onPhotoChange={photo => setOwnerInfo({ ...ownerInfo, photo })}
                />
                <InputField
                    label="이름"
                    type="text"
                    value={ownerInfo.name}
                    onChange={e => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
                    placeholder="이름을 입력해주세요"
                />
            </div>
        </div>
    );
};

export default StepOwnerInfo;
