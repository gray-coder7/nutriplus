const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const MONTH_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** 0 = lunes ... 6 = domingo, según la semana que contiene `date`. */
export function weekdayIndex(date: Date): number {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const weekday = new Date(utcMidnight).getUTCDay(); // 0 = domingo ... 6 = sábado
  return weekday === 0 ? 6 : weekday - 1;
}

/** Lunes (UTC medianoche) de la semana que contiene `date`. */
export function mondayOf(date: Date): Date {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return new Date(utcMidnight - weekdayIndex(date) * DAY_MS);
}

export function addWeeks(monday: Date, weeks: number): Date {
  return new Date(monday.getTime() + weeks * 7 * DAY_MS);
}

export function addDays(monday: Date, days: number): Date {
  return new Date(monday.getTime() + days * DAY_MS);
}

/** "2026-09-22" — usado en la URL (?week=) y como identificador estable. */
export function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parsea "2026-09-22" a UTC medianoche; si es inválido, usa la semana actual. */
export function parseWeekParam(param: string | undefined): Date {
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    const parsed = new Date(`${param}T00:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime())) return mondayOf(parsed);
  }
  return mondayOf(new Date());
}

export function formatWeekRangeLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getUTCMonth() === sunday.getUTCMonth();
  const startLabel = `${monday.getUTCDate()}`;
  const endLabel = sameMonth
    ? `${sunday.getUTCDate()} ${MONTH_LABELS[sunday.getUTCMonth()]}`
    : `${sunday.getUTCDate()} ${MONTH_LABELS[sunday.getUTCMonth()]}`;
  const startFull = sameMonth
    ? startLabel
    : `${startLabel} ${MONTH_LABELS[monday.getUTCMonth()]}`;
  return `${startFull} – ${endLabel}, ${sunday.getUTCFullYear()}`;
}
