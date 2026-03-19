"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHolidaysForYear = getHolidaysForYear;
function fmt(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}
function nthWeekday(year, month, weekday, n) {
    if (n > 0) {
        const d = new Date(year, month - 1, 1);
        let count = 0;
        while (true) {
            if (d.getDay() === weekday && ++count === n)
                return new Date(d);
            d.setDate(d.getDate() + 1);
        }
    }
    const d = new Date(year, month, 0);
    while (d.getDay() !== weekday)
        d.setDate(d.getDate() - 1);
    return d;
}
function easter(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}
function getHolidaysForYear(year) {
    const holidays = [];
    let idx = 0;
    const h = (date, name, country, category) => holidays.push({ id: `${country}-${idx++}-${date}`, date, name, country, category });
    const easterDate = easter(year);
    const carnival1 = addDays(easterDate, -48);
    const carnival2 = addDays(easterDate, -47);
    const holyThursday = addDays(easterDate, -3);
    const goodFriday = addDays(easterDate, -2);
    h(`${year}-01-01`, "New Year's Day", 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 1, 1, 3)), 'Martin Luther King Jr. Day', 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 2, 1, 3)), "Presidents' Day", 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 5, 1, -1)), 'Memorial Day', 'US', 'NATIONAL');
    h(`${year}-06-19`, 'Juneteenth', 'US', 'NATIONAL');
    h(`${year}-07-04`, 'Independence Day', 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 9, 1, 1)), 'Labor Day', 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 10, 1, 2)), 'Columbus Day', 'US', 'NATIONAL');
    h(`${year}-11-11`, 'Veterans Day', 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 11, 4, 4)), 'Thanksgiving Day', 'US', 'NATIONAL');
    h(`${year}-12-25`, 'Christmas Day', 'US', 'NATIONAL');
    h(fmt(nthWeekday(year, 9, 1, 1)), 'First Day of School (Fall)', 'US', 'SCHOOL');
    h(`${year}-01-06`, 'Classes Resume (Spring Semester)', 'US', 'SCHOOL');
    h(fmt(addDays(nthWeekday(year, 11, 4, 4), 1)), 'Thanksgiving Break Start', 'US', 'SCHOOL');
    h(fmt(addDays(nthWeekday(year, 11, 4, 4), 3)), 'Thanksgiving Break End', 'US', 'SCHOOL');
    h(`${year}-12-22`, 'Winter Break Start', 'US', 'SCHOOL');
    h(`${year}-01-02`, 'Winter Break End', 'US', 'SCHOOL');
    h(fmt(nthWeekday(year, 3, 1, 4)), 'Spring Break Start', 'US', 'SCHOOL');
    h(fmt(addDays(nthWeekday(year, 3, 1, 4), 7)), 'Spring Break End', 'US', 'SCHOOL');
    h(fmt(nthWeekday(year, 6, 5, 1)), 'Last Day of School (Spring)', 'US', 'SCHOOL');
    h(`${year}-01-01`, 'Año Nuevo', 'AR', 'NATIONAL');
    h(fmt(carnival1), 'Carnaval (lunes)', 'AR', 'NATIONAL');
    h(fmt(carnival2), 'Carnaval (martes)', 'AR', 'NATIONAL');
    h(`${year}-03-23`, 'Día de la Memoria por la Verdad y la Justicia', 'AR', 'NATIONAL');
    h(`${year}-04-02`, 'Día del Veterano y de los Caídos en Malvinas', 'AR', 'NATIONAL');
    h(fmt(holyThursday), 'Jueves Santo', 'AR', 'NATIONAL');
    h(fmt(goodFriday), 'Viernes Santo', 'AR', 'NATIONAL');
    h(`${year}-05-01`, 'Día del Trabajador', 'AR', 'NATIONAL');
    h(`${year}-05-25`, 'Día de la Revolución de Mayo', 'AR', 'NATIONAL');
    h(`${year}-06-20`, 'Día de la Bandera — Paso a la Inmortalidad del Gral. Belgrano', 'AR', 'NATIONAL');
    h(`${year}-07-09`, 'Día de la Independencia', 'AR', 'NATIONAL');
    h(`${year}-08-17`, 'Paso a la Inmortalidad del Gral. San Martín', 'AR', 'NATIONAL');
    h(`${year}-10-12`, 'Día del Respeto a la Diversidad Cultural', 'AR', 'NATIONAL');
    h(`${year}-11-20`, 'Día de la Soberanía Nacional', 'AR', 'NATIONAL');
    h(`${year}-12-08`, 'Inmaculada Concepción de María', 'AR', 'NATIONAL');
    h(`${year}-12-25`, 'Navidad', 'AR', 'NATIONAL');
    h(`${year}-03-02`, 'Inicio del Ciclo Lectivo', 'AR', 'SCHOOL');
    h(fmt(addDays(holyThursday, -3)), 'Inicio Receso Semana Santa', 'AR', 'SCHOOL');
    h(fmt(addDays(goodFriday, 3)), 'Fin Receso Semana Santa', 'AR', 'SCHOOL');
    h(`${year}-07-06`, 'Inicio Vacaciones de Invierno', 'AR', 'SCHOOL');
    h(`${year}-07-17`, 'Fin Vacaciones de Invierno', 'AR', 'SCHOOL');
    h(`${year}-09-21`, 'Día de la Primavera (no hay clases)', 'AR', 'SCHOOL');
    h(`${year}-12-18`, 'Último Día de Clases', 'AR', 'SCHOOL');
    return holidays.sort((a, b) => a.date.localeCompare(b.date));
}
//# sourceMappingURL=holidays.data.js.map