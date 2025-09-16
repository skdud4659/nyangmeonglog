import { createWalk, type WalkPathPoint } from '@/features/main/walk/api/walksApi';
import { useAuthStore } from '@/shared/store/authStore';
import { useState } from 'react';

type LatLng = { lat: number; lng: number };

const SaveWalkButton = ({
    petId,
    path,
    distance,
    duration,
    onClose,
}: {
    petId: string;
    path: LatLng[];
    distance: number;
    duration: number;
    onClose: () => void;
}) => {
    const user = useAuthStore(s => s.user);
    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => {
        if (!user?.id || !petId) return onClose();
        setIsSaving(true);
        try {
            const now = new Date();
            const startedAt = new Date(now.getTime() - duration * 1000);
            await createWalk({
                userId: user.id,
                petId,
                startedAt: startedAt.toISOString().slice(0, 19),
                endedAt: now.toISOString().slice(0, 19),
                durationSec: duration,
                distanceM: Number(distance.toFixed(1)),
                path: path as WalkPathPoint[],
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <button
            className={`flex-1 h-12 rounded-full text-white ${isSaving ? 'bg-gray-300' : 'bg-primary'}`}
            onClick={handleSave}
            disabled={isSaving}
        >
            {isSaving ? '저장 중...' : '저장'}
        </button>
    );
};

export default SaveWalkButton;
