export type EventCategory =
    | 'feed' // 사료
    | 'snack' // 간식
    | 'water' // 물
    | 'poop' // 대변
    | 'pee' // 소변
    | 'grooming' // 미용/목욕/양치
    | 'medicine' // 약
    | 'checkup'; // 구충/접종/건강검진

export interface EventItem {
    id: string;
    date: string; // YYYY-MM-DD
    category: EventCategory;
}
