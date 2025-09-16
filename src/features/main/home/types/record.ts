export type SimpleRecord = {
    id: string;
    date: string;
    petId: string;
    food: boolean;
    water: boolean;
    snack: boolean;
    poop: boolean;
    pee: boolean;
    supplements?: string[]; // 복용한 영양제 목록(0개 이상)
    extras?: {
        brush: boolean;
        bath: boolean;
        grooming: boolean;
    };
    health?: {
        spasm?: { note?: string; photoUrl?: string | null };
        vaccination?: { note?: string; photoUrl?: string | null };
        checkup?: { note?: string; photoUrl?: string | null };
    };
};
