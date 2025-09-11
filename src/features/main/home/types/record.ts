export type SimpleRecord = {
    id: string;
    date: string;
    petId: string;
    food: boolean;
    water: boolean;
    snack: boolean;
    poop: boolean;
    pee: boolean;
    supplements?: string[];
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
