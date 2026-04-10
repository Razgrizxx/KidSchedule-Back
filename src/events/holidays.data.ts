export interface HolidayEntry {
  id: string
  date: string // YYYY-MM-DD
  name: string
  country: 'AR' | 'US'
  category: 'NATIONAL' | 'SCHOOL'
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** nth weekday of a given month (1-based month, 0=Sun weekday, n=-1 means last) */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  if (n > 0) {
    const d = new Date(year, month - 1, 1)
    let count = 0
    while (true) {
      if (d.getDay() === weekday && ++count === n) return new Date(d)
      d.setDate(d.getDate() + 1)
    }
  }
  // last weekday
  const d = new Date(year, month, 0)
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1)
  return d
}

/** Anonymous Gregorian Easter algorithm */
function easter(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

// ── Main export ───────────────────────────────────────────────────────────────

export function getHolidaysForYear(year: number): HolidayEntry[] {
  const holidays: HolidayEntry[] = []
  let idx = 0

  const h = (date: string, name: string, country: 'AR' | 'US', category: 'NATIONAL' | 'SCHOOL') =>
    holidays.push({ id: `${country}-${idx++}-${date}`, date, name, country, category })

  const easterDate = easter(year)
  const carnival1 = addDays(easterDate, -48)
  const carnival2 = addDays(easterDate, -47)
  const holyThursday = addDays(easterDate, -3)
  const goodFriday = addDays(easterDate, -2)

  // ── US National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'US', 'NATIONAL')
  h(fmt(nthWeekday(year, 1, 1, 3)), 'Martin Luther King Jr. Day', 'US', 'NATIONAL')
  h(fmt(nthWeekday(year, 2, 1, 3)), "Presidents' Day", 'US', 'NATIONAL')
  h(fmt(nthWeekday(year, 5, 1, -1)), 'Memorial Day', 'US', 'NATIONAL')
  h(`${year}-06-19`, 'Juneteenth', 'US', 'NATIONAL')
  h(`${year}-07-04`, 'Independence Day', 'US', 'NATIONAL')
  h(fmt(nthWeekday(year, 9, 1, 1)), 'Labor Day', 'US', 'NATIONAL')
  h(fmt(nthWeekday(year, 10, 1, 2)), 'Columbus Day', 'US', 'NATIONAL')
  h(`${year}-11-11`, 'Veterans Day', 'US', 'NATIONAL')
  h(fmt(nthWeekday(year, 11, 4, 4)), 'Thanksgiving Day', 'US', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'US', 'NATIONAL')

  // ── US School ───────────────────────────────────────────────────────────────
  h(fmt(nthWeekday(year, 9, 1, 1)), 'First Day of School (Fall)', 'US', 'SCHOOL')
  h(`${year}-01-06`, 'Classes Resume (Spring Semester)', 'US', 'SCHOOL')
  h(fmt(addDays(nthWeekday(year, 11, 4, 4), 1)), 'Thanksgiving Break Start', 'US', 'SCHOOL')
  h(fmt(addDays(nthWeekday(year, 11, 4, 4), 3)), 'Thanksgiving Break End', 'US', 'SCHOOL')
  h(`${year}-12-22`, 'Winter Break Start', 'US', 'SCHOOL')
  h(`${year}-01-02`, 'Winter Break End', 'US', 'SCHOOL')
  h(fmt(nthWeekday(year, 3, 1, 4)), 'Spring Break Start', 'US', 'SCHOOL')
  h(fmt(addDays(nthWeekday(year, 3, 1, 4), 7)), 'Spring Break End', 'US', 'SCHOOL')
  h(fmt(nthWeekday(year, 6, 5, 1)), 'Last Day of School (Spring)', 'US', 'SCHOOL')

  // ── AR National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'AR', 'NATIONAL')
  h(fmt(carnival1), 'Carnival (Monday)', 'AR', 'NATIONAL')
  h(fmt(carnival2), 'Carnival (Tuesday)', 'AR', 'NATIONAL')
  h(`${year}-03-23`, 'National Day of Memory for Truth and Justice', 'AR', 'NATIONAL')
  h(`${year}-04-02`, 'Day of the Veterans and Fallen in the Falklands', 'AR', 'NATIONAL')
  h(fmt(holyThursday), 'Holy Thursday', 'AR', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'AR', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'AR', 'NATIONAL')
  h(`${year}-05-25`, 'May Revolution Day', 'AR', 'NATIONAL')
  h(`${year}-06-20`, 'Flag Day — General Belgrano', 'AR', 'NATIONAL')
  h(`${year}-07-09`, 'Independence Day', 'AR', 'NATIONAL')
  h(`${year}-08-17`, 'General San Martín Day', 'AR', 'NATIONAL')
  h(`${year}-10-12`, 'Day of Cultural Diversity', 'AR', 'NATIONAL')
  h(`${year}-11-20`, 'National Sovereignty Day', 'AR', 'NATIONAL')
  h(`${year}-12-08`, 'Immaculate Conception', 'AR', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'AR', 'NATIONAL')

  // ── AR School ───────────────────────────────────────────────────────────────
  h(`${year}-03-02`, 'School Year Start', 'AR', 'SCHOOL')
  h(fmt(addDays(holyThursday, -3)), 'Easter Break Start', 'AR', 'SCHOOL')
  h(fmt(addDays(goodFriday, 3)), 'Easter Break End', 'AR', 'SCHOOL')
  h(`${year}-07-06`, 'Winter Break Start', 'AR', 'SCHOOL')
  h(`${year}-07-17`, 'Winter Break End', 'AR', 'SCHOOL')
  h(`${year}-09-21`, 'Spring Day (no classes)', 'AR', 'SCHOOL')
  h(`${year}-12-18`, 'Last Day of School', 'AR', 'SCHOOL')

  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}
