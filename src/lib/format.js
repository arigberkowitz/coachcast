// Date helpers for the timeline and recap cards.

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function fmtFullDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
}

// A short, shareable code the coach/tutor gives a family so the parent/student can
// view that athlete's progress in the portal. Deterministic from the athlete id.
export function athleteCode(athlete) {
  let h = 0;
  for (let i = 0; i < athlete.id.length; i++) h = (h * 31 + athlete.id.charCodeAt(i)) >>> 0;
  const num = (h % 9000) + 1000;
  const name = athlete.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'CODE';
  return `${name}-${num}`;
}

// The homework block as plain text (assignment + how-to + drill link), for copy/email.
export function homeworkBlock(recap, brand) {
  if (!recap.homework) return '';
  let s = `\n\n${brand.recap.homework}: ${recap.homework}`;
  if (recap.homeworkHow) s += `\nHow: ${recap.homeworkHow}`;
  if (recap.homeworkLink) s += `\nWatch: ${recap.homeworkLink}`;
  return s;
}

// The full parent-facing recap text (message + homework block) for copy/email.
export function recapShareText(recap, brand) {
  return recap.parentMessage + homeworkBlock(recap, brand);
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
