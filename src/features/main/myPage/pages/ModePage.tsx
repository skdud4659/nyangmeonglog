import StepModeSelection from '@/features/onBoarding/components/StepModeSelection';
import { useModeSelection } from '@/features/onBoarding/hooks/useModeSelection';
import Button from '@/shared/components/atoms/Button';
import TopNavigation from '@/shared/components/molecules/TopNavigation';
import { useSettingsStore } from '@/shared/store/settingsStore';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

const ModePage = () => {
    const navigate = useNavigate();
    const appMode = useSettingsStore(s => s.mode);
    const setAppMode = useSettingsStore(s => s.setMode);
    const { modeSettings, setModeSettings } = useModeSelection();

    useEffect(() => {
        setModeSettings({ mode: appMode });
    }, [appMode, setModeSettings]);

    const handleSave = () => {
        setAppMode(modeSettings.mode);
        navigate({ to: '/main/myPage' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <TopNavigation onBack={() => navigate({ to: '/main/myPage' })} />
            <main className="flex flex-col flex-1 pt-12 px-6 gap-3">
                <StepModeSelection modeSettings={modeSettings} setModeSettings={setModeSettings} />
                <Button type="button" label="저장" onClick={handleSave} />
            </main>
        </div>
    );
};

export default ModePage;
