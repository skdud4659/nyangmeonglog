import {
    modeSelectionSchema,
    type ModeSelectionData,
} from '@/features/onBoarding/schemas/modeSelectionSchema';
import { useState } from 'react';

export const useModeSelection = () => {
    const [modeSettings, setModeSettings] = useState<ModeSelectionData>({
        mode: 'simple',
    });

    const validate = () => {
        modeSelectionSchema.parse(modeSettings);
    };

    return {
        modeSettings,
        setModeSettings,
        validate,
    };
};
