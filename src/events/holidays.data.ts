export interface HolidayEntry {
  id: string
  date: string // YYYY-MM-DD
  name: string
  country: string
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

  const h = (date: string, name: string, country: string, category: 'NATIONAL' | 'SCHOOL') =>
    holidays.push({ id: `${country}-${idx++}-${date}`, date, name, country, category })

  const easterDate = easter(year)
  const carnival1 = addDays(easterDate, -48)
  const carnival2 = addDays(easterDate, -47)
  const holyThursday = addDays(easterDate, -3)
  const goodFriday = addDays(easterDate, -2)
  const easterMonday = addDays(easterDate, 1)
  const ascension = addDays(easterDate, 39)
  const whitMonday = addDays(easterDate, 50)
  const corpusChristi = addDays(easterDate, 60)

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

  // ── BR National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'BR', 'NATIONAL')
  h(fmt(carnival1), 'Carnival (Monday)', 'BR', 'NATIONAL')
  h(fmt(carnival2), 'Carnival (Tuesday)', 'BR', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'BR', 'NATIONAL')
  h(`${year}-04-21`, 'Tiradentes Day', 'BR', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'BR', 'NATIONAL')
  h(fmt(corpusChristi), 'Corpus Christi', 'BR', 'NATIONAL')
  h(`${year}-09-07`, 'Independence Day', 'BR', 'NATIONAL')
  h(`${year}-10-12`, 'Nossa Senhora Aparecida', 'BR', 'NATIONAL')
  h(`${year}-11-02`, "All Souls' Day", 'BR', 'NATIONAL')
  h(`${year}-11-15`, 'Republic Day', 'BR', 'NATIONAL')
  h(`${year}-11-20`, 'Black Consciousness Day', 'BR', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'BR', 'NATIONAL')

  // ── BR School ───────────────────────────────────────────────────────────────
  h(`${year}-02-03`, 'School Year Start', 'BR', 'SCHOOL')
  h(fmt(addDays(carnival1, -1)), 'Carnival Break Start', 'BR', 'SCHOOL')
  h(fmt(addDays(carnival2, 1)), 'Carnival Break End', 'BR', 'SCHOOL')
  h(`${year}-07-14`, 'Winter Break Start', 'BR', 'SCHOOL')
  h(`${year}-07-28`, 'Winter Break End', 'BR', 'SCHOOL')
  h(`${year}-12-19`, 'Last Day of School', 'BR', 'SCHOOL')

  // ── CL National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'CL', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'CL', 'NATIONAL')
  h(fmt(easterDate), 'Easter Saturday', 'CL', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'CL', 'NATIONAL')
  h(`${year}-05-21`, 'Navy Day', 'CL', 'NATIONAL')
  h(fmt(corpusChristi), 'Corpus Christi', 'CL', 'NATIONAL')
  h(`${year}-06-29`, 'Saints Peter and Paul', 'CL', 'NATIONAL')
  h(`${year}-07-16`, 'Our Lady of Mount Carmel', 'CL', 'NATIONAL')
  h(`${year}-08-15`, 'Assumption of Mary', 'CL', 'NATIONAL')
  h(`${year}-09-18`, 'Independence Day', 'CL', 'NATIONAL')
  h(`${year}-09-19`, 'Army Day', 'CL', 'NATIONAL')
  h(`${year}-10-12`, 'Day of the Races', 'CL', 'NATIONAL')
  h(`${year}-11-01`, "All Saints' Day", 'CL', 'NATIONAL')
  h(`${year}-12-08`, 'Immaculate Conception', 'CL', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'CL', 'NATIONAL')

  // ── CL School ───────────────────────────────────────────────────────────────
  h(`${year}-03-03`, 'School Year Start', 'CL', 'SCHOOL')
  h(fmt(addDays(goodFriday, -1)), 'Easter Break Start', 'CL', 'SCHOOL')
  h(fmt(addDays(easterMonday, 1)), 'Easter Break End', 'CL', 'SCHOOL')
  h(`${year}-07-13`, 'Winter Break Start', 'CL', 'SCHOOL')
  h(`${year}-07-28`, 'Winter Break End', 'CL', 'SCHOOL')
  h(`${year}-12-18`, 'Last Day of School', 'CL', 'SCHOOL')

  // ── MX National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'MX', 'NATIONAL')
  h(fmt(nthWeekday(year, 2, 1, 1)), 'Constitution Day', 'MX', 'NATIONAL')
  h(fmt(nthWeekday(year, 3, 1, 3)), "Benito Juárez's Birthday", 'MX', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'MX', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'MX', 'NATIONAL')
  h(`${year}-09-16`, 'Independence Day', 'MX', 'NATIONAL')
  h(fmt(nthWeekday(year, 11, 1, 3)), 'Revolution Day', 'MX', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'MX', 'NATIONAL')

  // ── MX School ───────────────────────────────────────────────────────────────
  h(`${year}-08-26`, 'School Year Start', 'MX', 'SCHOOL')
  h(`${year}-11-02`, 'Day of the Dead (No School)', 'MX', 'SCHOOL')
  h(`${year}-12-20`, 'Winter Break Start', 'MX', 'SCHOOL')
  h(`${year}-01-07`, 'Winter Break End', 'MX', 'SCHOOL')
  h(fmt(addDays(goodFriday, -3)), 'Spring Break Start', 'MX', 'SCHOOL')
  h(fmt(addDays(easterMonday, 1)), 'Spring Break End', 'MX', 'SCHOOL')
  h(`${year}-07-04`, 'Last Day of School', 'MX', 'SCHOOL')

  // ── CO National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'CO', 'NATIONAL')
  h(fmt(nthWeekday(year, 1, 1, 1)), 'Epiphany', 'CO', 'NATIONAL')
  h(fmt(holyThursday), 'Holy Thursday', 'CO', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'CO', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'CO', 'NATIONAL')
  h(fmt(ascension), 'Ascension Day', 'CO', 'NATIONAL')
  h(fmt(corpusChristi), 'Corpus Christi', 'CO', 'NATIONAL')
  h(`${year}-07-20`, 'Independence Day', 'CO', 'NATIONAL')
  h(`${year}-08-07`, 'Battle of Boyacá', 'CO', 'NATIONAL')
  h(`${year}-08-15`, 'Assumption of Mary', 'CO', 'NATIONAL')
  h(`${year}-10-12`, 'Columbus Day', 'CO', 'NATIONAL')
  h(`${year}-11-01`, "All Saints' Day", 'CO', 'NATIONAL')
  h(`${year}-11-11`, 'Independence of Cartagena', 'CO', 'NATIONAL')
  h(`${year}-12-08`, 'Immaculate Conception', 'CO', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'CO', 'NATIONAL')

  // ── CO School ───────────────────────────────────────────────────────────────
  h(`${year}-01-20`, 'School Year Start', 'CO', 'SCHOOL')
  h(fmt(addDays(goodFriday, -3)), 'Easter Break Start', 'CO', 'SCHOOL')
  h(fmt(addDays(easterMonday, 1)), 'Easter Break End', 'CO', 'SCHOOL')
  h(`${year}-06-28`, 'Mid-Year Break Start', 'CO', 'SCHOOL')
  h(`${year}-07-14`, 'Mid-Year Break End', 'CO', 'SCHOOL')
  h(`${year}-11-28`, 'Last Day of School', 'CO', 'SCHOOL')

  // ── UY National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'UY', 'NATIONAL')
  h(`${year}-01-06`, 'Epiphany', 'UY', 'NATIONAL')
  h(fmt(carnival1), 'Carnival (Monday)', 'UY', 'NATIONAL')
  h(fmt(carnival2), 'Carnival (Tuesday)', 'UY', 'NATIONAL')
  h(fmt(holyThursday), 'Holy Thursday', 'UY', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'UY', 'NATIONAL')
  h(`${year}-04-19`, 'Landing of the 33 Orientals', 'UY', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'UY', 'NATIONAL')
  h(`${year}-05-18`, 'Battle of Las Piedras', 'UY', 'NATIONAL')
  h(`${year}-06-19`, 'Artigas Day', 'UY', 'NATIONAL')
  h(`${year}-07-18`, 'Constitution Day', 'UY', 'NATIONAL')
  h(`${year}-08-25`, 'Independence Day', 'UY', 'NATIONAL')
  h(`${year}-10-12`, 'Day of Cultural Diversity', 'UY', 'NATIONAL')
  h(`${year}-11-02`, "All Souls' Day", 'UY', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'UY', 'NATIONAL')

  // ── UY School ───────────────────────────────────────────────────────────────
  h(`${year}-03-03`, 'School Year Start', 'UY', 'SCHOOL')
  h(fmt(addDays(holyThursday, -3)), 'Easter Break Start', 'UY', 'SCHOOL')
  h(fmt(addDays(goodFriday, 3)), 'Easter Break End', 'UY', 'SCHOOL')
  h(`${year}-07-06`, 'Winter Break Start', 'UY', 'SCHOOL')
  h(`${year}-07-21`, 'Winter Break End', 'UY', 'SCHOOL')
  h(`${year}-12-19`, 'Last Day of School', 'UY', 'SCHOOL')

  // ── CA National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'CA', 'NATIONAL')
  h(fmt(nthWeekday(year, 2, 1, 3)), 'Family Day', 'CA', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'CA', 'NATIONAL')
  h(fmt(easterMonday), 'Easter Monday', 'CA', 'NATIONAL')
  h(fmt(nthWeekday(year, 5, 1, -1)), 'Victoria Day', 'CA', 'NATIONAL')
  h(`${year}-07-01`, 'Canada Day', 'CA', 'NATIONAL')
  h(fmt(nthWeekday(year, 9, 1, 1)), 'Labour Day', 'CA', 'NATIONAL')
  h(fmt(nthWeekday(year, 10, 1, 2)), 'Thanksgiving', 'CA', 'NATIONAL')
  h(`${year}-11-11`, 'Remembrance Day', 'CA', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'CA', 'NATIONAL')
  h(`${year}-12-26`, 'Boxing Day', 'CA', 'NATIONAL')

  // ── CA School ───────────────────────────────────────────────────────────────
  h(fmt(addDays(nthWeekday(year, 9, 1, 1), 1)), 'First Day of School (Fall)', 'CA', 'SCHOOL')
  h(`${year}-12-23`, 'Winter Break Start', 'CA', 'SCHOOL')
  h(`${year}-01-05`, 'Winter Break End', 'CA', 'SCHOOL')
  h(fmt(addDays(goodFriday, -7)), 'Spring Break Start', 'CA', 'SCHOOL')
  h(fmt(addDays(easterMonday, 1)), 'Spring Break End', 'CA', 'SCHOOL')
  h(`${year}-06-28`, 'Last Day of School', 'CA', 'SCHOOL')

  // ── ES National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'ES', 'NATIONAL')
  h(`${year}-01-06`, 'Epiphany', 'ES', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'ES', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'ES', 'NATIONAL')
  h(`${year}-08-15`, 'Assumption of Mary', 'ES', 'NATIONAL')
  h(`${year}-10-12`, 'National Day of Spain', 'ES', 'NATIONAL')
  h(`${year}-11-01`, "All Saints' Day", 'ES', 'NATIONAL')
  h(`${year}-12-06`, 'Constitution Day', 'ES', 'NATIONAL')
  h(`${year}-12-08`, 'Immaculate Conception', 'ES', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'ES', 'NATIONAL')

  // ── ES School ───────────────────────────────────────────────────────────────
  h(`${year}-09-09`, 'School Year Start', 'ES', 'SCHOOL')
  h(`${year}-12-23`, 'Christmas Break Start', 'ES', 'SCHOOL')
  h(`${year}-01-08`, 'Christmas Break End', 'ES', 'SCHOOL')
  h(fmt(addDays(goodFriday, -6)), 'Easter Break Start', 'ES', 'SCHOOL')
  h(fmt(addDays(easterMonday, 1)), 'Easter Break End', 'ES', 'SCHOOL')
  h(`${year}-06-20`, 'Last Day of School', 'ES', 'SCHOOL')

  // ── GB National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'GB', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'GB', 'NATIONAL')
  h(fmt(easterMonday), 'Easter Monday', 'GB', 'NATIONAL')
  h(fmt(nthWeekday(year, 5, 1, 1)), 'Early May Bank Holiday', 'GB', 'NATIONAL')
  h(fmt(nthWeekday(year, 5, 1, -1)), 'Spring Bank Holiday', 'GB', 'NATIONAL')
  h(fmt(nthWeekday(year, 8, 1, -1)), 'Summer Bank Holiday', 'GB', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'GB', 'NATIONAL')
  h(`${year}-12-26`, 'Boxing Day', 'GB', 'NATIONAL')

  // ── GB School ───────────────────────────────────────────────────────────────
  h(`${year}-09-04`, 'Autumn Term Start', 'GB', 'SCHOOL')
  h(fmt(nthWeekday(year, 10, 1, -1)), 'Half-Term Start (Autumn)', 'GB', 'SCHOOL')
  h(fmt(addDays(nthWeekday(year, 10, 1, -1), 7)), 'Half-Term End (Autumn)', 'GB', 'SCHOOL')
  h(`${year}-12-20`, 'Christmas Break Start', 'GB', 'SCHOOL')
  h(`${year}-01-06`, 'Spring Term Start', 'GB', 'SCHOOL')
  h(fmt(addDays(goodFriday, -14)), 'Half-Term Start (Spring)', 'GB', 'SCHOOL')
  h(fmt(addDays(goodFriday, -8)), 'Half-Term End (Spring)', 'GB', 'SCHOOL')
  h(fmt(addDays(goodFriday, -1)), 'Easter Break Start', 'GB', 'SCHOOL')
  h(fmt(addDays(easterMonday, 8)), 'Easter Break End', 'GB', 'SCHOOL')
  h(fmt(nthWeekday(year, 5, 1, -1)), 'Half-Term Start (Summer)', 'GB', 'SCHOOL')
  h(fmt(addDays(nthWeekday(year, 5, 1, -1), 7)), 'Half-Term End (Summer)', 'GB', 'SCHOOL')
  h(`${year}-07-22`, 'Summer Break Start', 'GB', 'SCHOOL')

  // ── FR National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'FR', 'NATIONAL')
  h(fmt(easterMonday), 'Easter Monday', 'FR', 'NATIONAL')
  h(`${year}-05-01`, "Fête du Travail (Workers' Day)", 'FR', 'NATIONAL')
  h(`${year}-05-08`, 'Victory in Europe Day', 'FR', 'NATIONAL')
  h(fmt(ascension), 'Ascension Day', 'FR', 'NATIONAL')
  h(fmt(whitMonday), 'Whit Monday', 'FR', 'NATIONAL')
  h(`${year}-07-14`, 'Bastille Day', 'FR', 'NATIONAL')
  h(`${year}-08-15`, 'Assumption of Mary', 'FR', 'NATIONAL')
  h(`${year}-11-01`, "All Saints' Day", 'FR', 'NATIONAL')
  h(`${year}-11-11`, 'Armistice Day', 'FR', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'FR', 'NATIONAL')

  // ── FR School ───────────────────────────────────────────────────────────────
  h(`${year}-09-02`, 'School Year Start (Rentrée)', 'FR', 'SCHOOL')
  h(`${year}-10-22`, 'Autumn Break Start', 'FR', 'SCHOOL')
  h(`${year}-11-04`, 'Autumn Break End', 'FR', 'SCHOOL')
  h(`${year}-12-21`, 'Christmas Break Start', 'FR', 'SCHOOL')
  h(`${year}-01-06`, 'Christmas Break End', 'FR', 'SCHOOL')
  h(`${year}-02-17`, 'Winter Break Start', 'FR', 'SCHOOL')
  h(`${year}-03-03`, 'Winter Break End', 'FR', 'SCHOOL')
  h(fmt(addDays(goodFriday, -1)), 'Spring Break Start', 'FR', 'SCHOOL')
  h(fmt(addDays(easterMonday, 14)), 'Spring Break End', 'FR', 'SCHOOL')
  h(`${year}-07-05`, 'Last Day of School', 'FR', 'SCHOOL')

  // ── DE National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'DE', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'DE', 'NATIONAL')
  h(fmt(easterMonday), 'Easter Monday', 'DE', 'NATIONAL')
  h(`${year}-05-01`, 'Labour Day', 'DE', 'NATIONAL')
  h(fmt(ascension), 'Ascension Day', 'DE', 'NATIONAL')
  h(fmt(whitMonday), 'Whit Monday', 'DE', 'NATIONAL')
  h(`${year}-10-03`, 'German Unity Day', 'DE', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'DE', 'NATIONAL')
  h(`${year}-12-26`, 'Second Day of Christmas', 'DE', 'NATIONAL')

  // ── DE School ───────────────────────────────────────────────────────────────
  h(`${year}-09-02`, 'School Year Start', 'DE', 'SCHOOL')
  h(`${year}-10-06`, 'Autumn Break Start', 'DE', 'SCHOOL')
  h(`${year}-10-18`, 'Autumn Break End', 'DE', 'SCHOOL')
  h(`${year}-12-23`, 'Christmas Break Start', 'DE', 'SCHOOL')
  h(`${year}-01-06`, 'Christmas Break End', 'DE', 'SCHOOL')
  h(fmt(addDays(goodFriday, -5)), 'Easter Break Start', 'DE', 'SCHOOL')
  h(fmt(addDays(easterMonday, 7)), 'Easter Break End', 'DE', 'SCHOOL')
  h(`${year}-06-26`, 'Last Day of School', 'DE', 'SCHOOL')

  // ── IT National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'IT', 'NATIONAL')
  h(`${year}-01-06`, 'Epiphany', 'IT', 'NATIONAL')
  h(fmt(easterMonday), 'Easter Monday', 'IT', 'NATIONAL')
  h(`${year}-04-25`, 'Liberation Day', 'IT', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'IT', 'NATIONAL')
  h(`${year}-06-02`, 'Republic Day', 'IT', 'NATIONAL')
  h(`${year}-08-15`, 'Ferragosto', 'IT', 'NATIONAL')
  h(`${year}-11-01`, "All Saints' Day", 'IT', 'NATIONAL')
  h(`${year}-12-08`, 'Immaculate Conception', 'IT', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'IT', 'NATIONAL')
  h(`${year}-12-26`, "St. Stephen's Day", 'IT', 'NATIONAL')

  // ── IT School ───────────────────────────────────────────────────────────────
  h(`${year}-09-16`, 'School Year Start', 'IT', 'SCHOOL')
  h(`${year}-12-23`, 'Christmas Break Start', 'IT', 'SCHOOL')
  h(`${year}-01-07`, 'Christmas Break End', 'IT', 'SCHOOL')
  h(fmt(addDays(goodFriday, -1)), 'Easter Break Start', 'IT', 'SCHOOL')
  h(fmt(addDays(easterMonday, 3)), 'Easter Break End', 'IT', 'SCHOOL')
  h(`${year}-06-10`, 'Last Day of School', 'IT', 'SCHOOL')

  // ── PT National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'PT', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'PT', 'NATIONAL')
  h(fmt(easterDate), 'Easter Sunday', 'PT', 'NATIONAL')
  h(`${year}-04-25`, 'Freedom Day', 'PT', 'NATIONAL')
  h(`${year}-05-01`, "Workers' Day", 'PT', 'NATIONAL')
  h(`${year}-06-10`, 'Portugal Day', 'PT', 'NATIONAL')
  h(`${year}-08-15`, 'Assumption of Mary', 'PT', 'NATIONAL')
  h(`${year}-10-05`, 'Republic Day', 'PT', 'NATIONAL')
  h(`${year}-11-01`, "All Saints' Day", 'PT', 'NATIONAL')
  h(`${year}-12-01`, 'Restoration of Independence', 'PT', 'NATIONAL')
  h(`${year}-12-08`, 'Immaculate Conception', 'PT', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'PT', 'NATIONAL')

  // ── PT School ───────────────────────────────────────────────────────────────
  h(`${year}-09-15`, 'School Year Start', 'PT', 'SCHOOL')
  h(`${year}-12-23`, 'Christmas Break Start', 'PT', 'SCHOOL')
  h(`${year}-01-06`, 'Christmas Break End', 'PT', 'SCHOOL')
  h(fmt(addDays(goodFriday, -5)), 'Easter Break Start', 'PT', 'SCHOOL')
  h(fmt(addDays(easterMonday, 3)), 'Easter Break End', 'PT', 'SCHOOL')
  h(`${year}-06-15`, 'Last Day of School', 'PT', 'SCHOOL')

  // ── AU National ─────────────────────────────────────────────────────────────
  h(`${year}-01-01`, "New Year's Day", 'AU', 'NATIONAL')
  h(`${year}-01-27`, 'Australia Day', 'AU', 'NATIONAL')
  h(fmt(goodFriday), 'Good Friday', 'AU', 'NATIONAL')
  h(fmt(addDays(goodFriday, 1)), 'Easter Saturday', 'AU', 'NATIONAL')
  h(fmt(easterMonday), 'Easter Monday', 'AU', 'NATIONAL')
  h(`${year}-04-25`, 'ANZAC Day', 'AU', 'NATIONAL')
  h(fmt(nthWeekday(year, 6, 1, 2)), "King's Birthday", 'AU', 'NATIONAL')
  h(fmt(nthWeekday(year, 9, 1, 1)), 'Labour Day', 'AU', 'NATIONAL')
  h(`${year}-12-25`, 'Christmas Day', 'AU', 'NATIONAL')
  h(`${year}-12-26`, 'Boxing Day', 'AU', 'NATIONAL')

  // ── AU School ───────────────────────────────────────────────────────────────
  h(`${year}-01-28`, 'Term 1 Start', 'AU', 'SCHOOL')
  h(fmt(addDays(goodFriday, -1)), 'Term 1 End', 'AU', 'SCHOOL')
  h(fmt(addDays(easterMonday, 14)), 'Term 2 Start', 'AU', 'SCHOOL')
  h(`${year}-06-27`, 'Term 2 End', 'AU', 'SCHOOL')
  h(`${year}-07-14`, 'Term 3 Start', 'AU', 'SCHOOL')
  h(`${year}-09-19`, 'Term 3 End', 'AU', 'SCHOOL')
  h(`${year}-10-06`, 'Term 4 Start', 'AU', 'SCHOOL')
  h(`${year}-12-19`, 'Term 4 End', 'AU', 'SCHOOL')

  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}
