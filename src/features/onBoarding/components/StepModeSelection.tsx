import type { ModeSelectionData } from '@/features/onBoarding/schemas/modeSelectionSchema';

interface StepModeSelectionProps {
    modeSettings: ModeSelectionData;
    setModeSettings: (settings: ModeSelectionData) => void;
}

const StepModeSelection = ({ modeSettings, setModeSettings }: StepModeSelectionProps) => {
    const handleModeSelect = (mode: 'simple' | 'detail') => {
        if (mode === 'simple') {
            setModeSettings({
                mode: 'simple',
            });
        } else {
            setModeSettings({
                mode: 'detail',
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 간단모드 */}
            <div
                className={`border rounded-xl transition-all duration-300 ${modeSettings.mode === 'simple' ? 'border-primary shadow-lg' : 'border-gray-200'}`}
            >
                <button
                    type="button"
                    onClick={() => handleModeSelect('simple')}
                    className="px-4 py-6"
                >
                    <div className="text-left">
                        <h2 className="text-lg font-bold text-gray-900">
                            간단모드{' '}
                            <span className="text-green-500 text-sm font-normal pl-2">
                                *모드는 나중에 변경할 수 있어요!
                            </span>
                        </h2>
                        <p className="text-sm text-gray_8 my-3">
                            간단모드에서는 간편하게 반려동물의
                            <br />
                            케어 상황을 체크 할 수 있어요!
                        </p>
                    </div>
                    <img src="/images/simpleMode.png" alt="간단모드 예시" className="w-full" />
                </button>
            </div>

            {/* 섬세모드 */}
            <div
                className={`border rounded-xl transition-all duration-300 ${
                    modeSettings.mode === 'detail' ? 'border-primary shadow-lg' : 'border-gray-200'
                }`}
            >
                <button
                    type="button"
                    onClick={() => handleModeSelect('detail')}
                    className="px-4 py-6"
                >
                    <div className="text-left">
                        <h2 className="text-lg font-bold text-gray-900">
                            섬세모드{' '}
                            <span className="text-green-500 text-sm font-normal pl-2">
                                *모드는 나중에 변경할 수 있어요!
                            </span>
                        </h2>
                        <p className="text-sm text-gray_8 my-3">
                            섬세모드에서는 정확하게 수치까지 기록하면서
                            <br />
                            반려동물의 케어 상황을 작성할 수 있어요!
                        </p>
                    </div>
                    <img src="/images/detailMode.png" alt="섬세모드 예시" className="w-full" />
                </button>
            </div>
        </div>
    );
};

export default StepModeSelection;
