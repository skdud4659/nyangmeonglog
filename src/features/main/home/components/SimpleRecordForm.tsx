import { eventIconMap } from '@/features/main/home/composables/icons';
import CatIcon from '@/shared/assets/icons/catIcon.svg?react';
import DogIcon from '@/shared/assets/icons/dogIcon.svg?react';

const samplePets = [
    { id: 'pet1', name: '초코', type: 'dog', photo: '/images/dog1.jpg' },
    { id: 'pet2', name: '나비', type: 'cat', photo: '/images/cat1.jpg' },
    { id: 'pet3', name: '몽이', type: 'dog' }, // 사진 없음
];

const activityList = [
    { key: 'feed', label: '사료', icon: eventIconMap['feed'] },
    { key: 'water', label: '물', icon: eventIconMap['water'] },
    { key: 'snack', label: '간식', icon: eventIconMap['snack'] },
    { key: 'poop', label: '대변', icon: eventIconMap['poop'] },
    { key: 'pee', label: '소변', icon: eventIconMap['pee'] },
];

const extraList = [
    { key: 'brush', label: '양치', icon: eventIconMap['brush'] },
    { key: 'bath', label: '목욕', icon: eventIconMap['bath'] },
    { key: 'grooming', label: '미용', icon: eventIconMap['grooming'] },
];

const healthList = [
    { key: 'spasm', label: '구충', icon: eventIconMap['spasm'] },
    { key: 'vaccination', label: '접종', icon: eventIconMap['vaccination'] },
    { key: 'checkup', label: '건강검진', icon: eventIconMap['checkup'] },
];

interface RecordFormProps {
    selectedDate: number;
    currentMonth: number;
    petId: string;
    onClose: () => void;
}

const RecordForm = ({ selectedDate, currentMonth, petId, onClose }: RecordFormProps) => {
    const activePet = samplePets.find(p => p.id === petId);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold">
                    {currentMonth + 1}월 {selectedDate}일 (목)
                </h2>
                <button className="text-red-400 font-medium" onClick={onClose}>
                    확인
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Pet Selector */}
                <div className="flex space-x-3">
                    {samplePets.map(pet => (
                        <button
                            key={pet.id}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                                pet.id === petId ? 'border-red-400' : 'border-gray-200'
                            }`}
                        >
                            {pet.photo ? (
                                <img
                                    src={pet.photo}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : pet.type === 'dog' ? (
                                <DogIcon className="w-full h-full p-2 text-gray-400" />
                            ) : (
                                <CatIcon className="w-full h-full p-2 text-gray-400" />
                            )}
                        </button>
                    ))}
                </div>

                {/* 오늘 달이는? */}
                <div>
                    <p className="mb-3 font-medium">오늘 달이는?</p>
                    <div className="flex space-x-4">
                        {activityList.map(act => (
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    key={act.key}
                                    className="w-16 h-16 bg-gray-100 items-center justify-center rounded-full flex flex-col text-sm text-gray-500"
                                >
                                    <act.icon className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-500">{act.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 영양제 */}
                <div>
                    <p className="mb-3 font-medium">영양제</p>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span>인트라젠 플러스 분말 반려동물 영양제</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span>베츠 닥터퍼펫 조인트케어 반려동물 영양제</span>
                        </label>
                    </div>
                </div>

                {/* 이것도 하셨다면 체크 */}
                <div>
                    <p className="mb-3 font-medium">이것도 하셨다면 체크!</p>
                    <div className="flex space-x-4">
                        {extraList.map(act => (
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    key={act.key}
                                    className="w-16 h-16 bg-gray-100 items-center justify-center rounded-full flex flex-col text-sm text-gray-500"
                                >
                                    <act.icon className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-500">{act.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 건강 상태 체크 */}
                <div>
                    <p className="mb-3 font-medium">건강 상태 체크하기</p>
                    <div className="space-y-3">
                        {healthList.map(health => (
                            <div key={health.key} className="flex items-center space-x-3">
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        key={health.key}
                                        className="w-16 h-16 bg-gray-100 items-center justify-center rounded-full flex flex-col text-sm text-gray-500"
                                    >
                                        <health.icon className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-500">{health.label}</span>
                                </div>
                                <input
                                    placeholder="특이사항이 있다면 입력해주세요.."
                                    className="flex-1 -mt-7 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                />
                                <button className="w-8 h-8 -mt-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                    📷
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordForm;
