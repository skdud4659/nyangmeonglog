import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import ProgressIndicator from '@/features/onBoarding/components/ProgressIndicator';
import StepCompletion from '@/features/onBoarding/components/StepCompletion';
import StepModeSelection from '@/features/onBoarding/components/StepModeSelection';
import StepOwnerInfo from '@/features/onBoarding/components/StepOwnerInfo';
import StepPetCount from '@/features/onBoarding/components/StepPetCount';
import StepPetDetails from '@/features/onBoarding/components/StepPetDetails';
import { useModeSelection } from '@/features/onBoarding/hooks/useModeSelection';
import { useOwnerInfo } from '@/features/onBoarding/hooks/useOwnerInfo';
import { usePetCount } from '@/features/onBoarding/hooks/usePetCount';
import { usePetDetails } from '@/features/onBoarding/hooks/usePetDetails';
import type { PetInfoData } from '@/features/onBoarding/schemas/petInfoSchema';

import { ROUTE_PATH } from '@/routes/constant';
import Button from '@/shared/components/atoms/Button';
import TopNavigation from '@/shared/components/molecules/TopNavegtion';
import { useNavigate } from '@tanstack/react-router';

const TOTAL_STEPS = 5;

const OnboardingPage = () => {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [currentPetIndex, setCurrentPetIndex] = useState(0);

    const { ownerInfo, setOwnerInfo, validate: validateOwner } = useOwnerInfo();
    const { petCount, setPetCount, validate: validatePetCount } = usePetCount();
    const { pets, setPets, updatePet, validate: validatePet } = usePetDetails();
    const { modeSettings, setModeSettings, validate: validateMode } = useModeSelection();

    useEffect(() => {
        const newPets: PetInfoData[] = [];
        for (let i = 0; i < petCount.dogs; i++) {
            // 데이터 임시 입력
            newPets.push({
                id: `dog-${i}`,
                name: '솜이',
                gender: 'male',
                birthDate: '2020-01-01',
                adoptionDate: '2020-01-01',
                breed: '포메라니안',
                weight: '5',
                isNeutered: null,
            });
        }
        for (let i = 0; i < petCount.cats; i++) {
            // 데이터 임시 입력
            newPets.push({
                id: `cat-${i}`,
                name: '김갈이',
                gender: 'female',
                birthDate: '2020-01-01',
                adoptionDate: '2020-01-01',
                breed: '스노우슈',
                weight: '5',
                isNeutered: true,
            });
        }
        setPets(newPets);
        setCurrentPetIndex(0);
    }, [petCount, setPets]);

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return validateOwner();
            case 1:
                return validatePetCount();
            case 2:
                return validatePet(currentPetIndex);
            case 3:
                return validateMode();
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (!isStepValid()) return;
        if (currentStep === 2 && currentPetIndex < pets.length - 1) {
            setCurrentPetIndex(currentPetIndex + 1);
        } else if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
            setCurrentPetIndex(0);
        }
    };

    const handleBack = () => {
        if (currentStep === 2 && currentPetIndex > 0) {
            setCurrentPetIndex(currentPetIndex - 1);
        } else if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            if (currentStep === 3 && pets.length > 0) {
                setCurrentPetIndex(pets.length - 1);
            }
        } else {
            navigate({ to: ROUTE_PATH.LOGIN });
        }
    };

    const steps = [
        <StepOwnerInfo ownerInfo={ownerInfo} setOwnerInfo={setOwnerInfo} />,
        <StepPetCount ownerInfo={ownerInfo} petCount={petCount} setPetCount={setPetCount} />,
        pets.length > 0 && (
            <StepPetDetails
                pet={pets[currentPetIndex]}
                updatePet={updates => updatePet(currentPetIndex, updates)}
                index={currentPetIndex}
            />
        ),
        <StepModeSelection modeSettings={modeSettings} setModeSettings={setModeSettings} />,
        <StepCompletion pets={pets} />,
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <TopNavigation onBack={handleBack}>
                <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </TopNavigation>

            <main className="flex flex-col flex-1 pt-20 px-6 gap-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentStep}-${currentPetIndex}`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {steps[currentStep]}
                        {currentStep < TOTAL_STEPS - 1 && (
                            <div className="pt-8">
                                <Button
                                    type="button"
                                    label={
                                        currentStep === 2 && currentPetIndex < pets.length - 1
                                            ? '다음 반려동물'
                                            : currentStep === 3
                                              ? '완료'
                                              : '다음페이지'
                                    }
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default OnboardingPage;
