export interface HolidayEntry {
    id: string;
    date: string;
    name: string;
    country: 'AR' | 'US';
    category: 'NATIONAL' | 'SCHOOL';
}
export declare function getHolidaysForYear(year: number): HolidayEntry[];
