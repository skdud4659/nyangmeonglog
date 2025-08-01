import { useModeSelection } from '@/features/onBoarding/hooks/useModeSelection';
import { useOwnerInfo } from '@/features/onBoarding/hooks/useOwnerInfo';
import { usePetCount } from '@/features/onBoarding/hooks/usePetCount';
import { usePetDetails } from '@/features/onBoarding/hooks/usePetDetails';
import { useState } from 'react';

export const TOTAL_STEPS = 5;

export const useOnboardingFlow = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [currentPetIndex, setCurrentPetIndex] = useState(0);

    const owner = useOwnerInfo();
    const petCount = usePetCount();
    const petDetails = usePetDetails();
    const mode = useModeSelection();

    const totalPets = petCount.petCount.dogs + petCount.petCount.cats;

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return owner.validate();
            case 1:
                return petCount.validate();
            case 2:
                return petDetails.validate(currentPetIndex);
            case 3:
                return mode.validate();
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (!isStepValid()) return;
        if (currentStep === 2 && currentPetIndex < petDetails.pets.length - 1) {
            setCurrentPetIndex(prev => prev + 1);
        } else if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(prev => prev + 1);
            setCurrentPetIndex(0);
        }
    };

    const prevStep = () => {
        if (currentStep === 2 && currentPetIndex > 0) {
            setCurrentPetIndex(prev => prev - 1);
        } else if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            if (currentStep === 3 && petDetails.pets.length > 0) {
                setCurrentPetIndex(petDetails.pets.length - 1);
            }
        }
    };

    return {
        currentStep,
        currentPetIndex,
        totalPets,
        owner,
        petCount,
        petDetails,
        mode,
        isStepValid,
        nextStep,
        prevStep,
    };
};
