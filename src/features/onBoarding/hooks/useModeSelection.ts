import {
    modeSelectionSchema,
    type ModeSelectionData,
} from '@/features/onBoarding/schemas/modeSelectionSchema';
import { useState } from 'react';
import { z } from 'zod';

export const useModeSelection = () => {
    const [modeSettings, setModeSettings] = useState<ModeSelectionData>({
        mode: 'simple',
    });

    const validate = () => {
        try {
            modeSelectionSchema.parse(modeSettings);
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                console.log(err.issues);
            }
            return false;
        }
    };

    return {
        modeSettings,
        setModeSettings,
        validate,
    };
};
