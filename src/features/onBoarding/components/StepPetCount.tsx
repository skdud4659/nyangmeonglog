import PetCounter from '@/features/onBoarding/components/PetCounter';
import type { OwnerInfoData } from '@/features/onBoarding/schemas/ownerInfoSchema';
import type { PetCountData } from '@/features/onBoarding/schemas/petCountSchema';

interface StepPetCountProps {
    ownerInfo: OwnerInfoData;
    petCount: PetCountData;
    setPetCount: (count: PetCountData) => void;
}

const StepPetCount = ({ ownerInfo, petCount, setPetCount }: StepPetCountProps) => (
    <div className="flex flex-col gap-28">
        <h1 className="text-3xl font-bold">
            {ownerInfo.name}님!
            <br />
            어떤 반려동물을
            <br />
            몇마리 키우시나요?
        </h1>
        <div className="flex justify-center gap-14">
            <PetCounter
                label="강아지"
                count={petCount.dogs}
                onChange={dogs => {
                    const newTotal = dogs + petCount.cats;
                    if (newTotal <= 4) setPetCount({ ...petCount, dogs });
                }}
                maxCount={4 - petCount.cats}
            />
            <PetCounter
                label="고양이"
                count={petCount.cats}
                onChange={cats => {
                    const newTotal = petCount.dogs + cats;
                    if (newTotal <= 4) setPetCount({ ...petCount, cats });
                }}
                maxCount={4 - petCount.dogs}
            />
        </div>
    </div>
);

export default StepPetCount;
