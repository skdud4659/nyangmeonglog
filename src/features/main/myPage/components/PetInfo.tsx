import type { PetItem } from '@/features/main/home/api/petsApi';

const PetInfo = ({ pet }: { pet?: PetItem }) => {
    const weightText = typeof pet?.weightKg === 'number' ? `${pet?.weightKg}kg` : '-';
    const breedText = pet?.breed ?? '-';
    const birthText = pet?.birthdate ? formatDate(pet.birthdate) : '-';
    const ageText = pet?.birthdate ? `${calcAgeYears(pet.birthdate)}살` : '-';
    return (
        <div className="flex bg-[#F38E8E]/10 rounded-xl mt-6 divide-x divide-gray-300 py-2 text-xs">
            <div className="flex-1 text-center py-1">
                <p className="text-gray-500">태어난 날(나이)</p>
                <p className="mt-2 font-semibold text-gray_6">
                    {birthText} {birthText !== '-' ? `(${ageText})` : ''}
                </p>
            </div>
            <div className="flex-1 text-center py-1">
                <p className="text-gray-500">몸무게</p>
                <p className=" mt-2 font-semibold text-gray_6">{weightText}</p>
            </div>
            <div className="flex-1 text-center py-1">
                <p className="text-gray-500">품종</p>
                <p className="mt-2 font-semibold text-gray_6">{breedText}</p>
            </div>
        </div>
    );
};

export default PetInfo;

function formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function calcAgeYears(isoDate: string): number {
    const birth = new Date(isoDate);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const hasNotHadBirthdayThisYear =
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (hasNotHadBirthdayThisYear) years -= 1;
    return Math.max(0, years);
}
