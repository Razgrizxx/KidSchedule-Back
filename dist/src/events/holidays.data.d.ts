export interface HolidayEntry {
    id: string;
    date: string;
    name: string;
    country: string;
    category: 'NATIONAL' | 'SCHOOL';
}
export declare function getHolidaysForYear(year: number): HolidayEntry[];
