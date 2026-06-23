// Date helpers for the timeline and recap cards.

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function fmtFullDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
}

export function relativeDate(iso) {
  const then = new Date(iso).getTime();
  const days = Math.round((Date.now() - then) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return fmtDate(iso);
}
