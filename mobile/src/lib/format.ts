const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export function peso(value: number | null | undefined): string {
  return pesoFormatter.format(value ?? 0);
}

/** "2026-10-05" → "Oct 5, 2026" without timezone shifts. */
export function formatDate(value: string | null | undefined, withYear = true): string {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${months[month - 1]} ${day}${withYear ? `, ${year}` : ''}`;
}

export function dateRange(from: string, to: string): string {
  return from === to ? formatDate(from) : `${formatDate(from, false)} – ${formatDate(to)}`;
}

/** 74 → "1h 14m"; 0 → "—". */
export function minutes(value: number): string {
  if (!value) {
    return '—';
  }

  const hours = Math.floor(value / 60);
  const rest = value % 60;

  return hours ? `${hours}h ${String(rest).padStart(2, '0')}m` : `${rest}m`;
}

/** Local calendar date as YYYY-MM-DD. */
export function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

/** The semi-monthly cut-off (1st–15th or 16th–end) containing the date, shifted by `offset` cut-offs. */
export function cutoff(date: Date, offset = 0): { from: string; to: string } {
  let year = date.getFullYear();
  let month = date.getMonth();
  let half = date.getDate() <= 15 ? 0 : 1;

  let index = month * 2 + half + offset;
  year += Math.floor(index / 24);
  index = ((index % 24) + 24) % 24;
  month = Math.floor(index / 2);
  half = index % 2;

  const lastDay = new Date(year, month + 1, 0).getDate();

  return {
    from: isoDate(new Date(year, month, half === 0 ? 1 : 16)),
    to: isoDate(new Date(year, month, half === 0 ? 15 : lastDay)),
  };
}
