// Pure derived stats for the Today dashboard. No React, no store coupling —
// each takes the athletes array so it can be unit-tested in isolation.

const WEEK_MS = 7 * 86400000;
export const DUE_DAYS = 7;

export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const isoDay = (d.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
  d.setDate(d.getDate() - isoDay);
  return d;
}

// All recaps across athletes, each carrying its athlete, newest first.
export function allRecaps(athletes) {
  return athletes
    .flatMap((a) => a.recaps.map((r) => ({ ...r, athlete: a })))
    .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
}

export function recentRecaps(athletes, n = 6) {
  return allRecaps(athletes).slice(0, n);
}

export function lastRecapTime(athlete) {
  if (!athlete.recaps.length) return null;
  return Math.max(...athlete.recaps.map((r) => new Date(r.createdAt).getTime()));
}

export function recapsThisWeek(athletes, now = Date.now()) {
  const start = startOfWeek(now).getTime();
  return allRecaps(athletes).filter((r) => new Date(r.createdAt).getTime() >= start).length;
}

export function athletesRecappedThisWeek(athletes, now = Date.now()) {
  const start = startOfWeek(now).getTime();
  const ids = new Set(
    allRecaps(athletes)
      .filter((r) => new Date(r.createdAt).getTime() >= start)
      .map((r) => r.athlete.id),
  );
  return ids.size;
}

// Consecutive weeks (ending at the most recent week with a recap) that have >=1 recap.
export function weekStreak(athletes, now = Date.now()) {
  const weeks = new Set(
    allRecaps(athletes).map((r) => startOfWeek(r.createdAt).getTime()),
  );
  if (!weeks.size) return 0;

  const cur = startOfWeek(now).getTime();
  let anchor;
  if (weeks.has(cur)) anchor = cur;
  else if (weeks.has(cur - WEEK_MS)) anchor = cur - WEEK_MS;
  else return 0;

  let count = 0;
  for (let w = anchor; weeks.has(w); w -= WEEK_MS) count++;
  return count;
}

// Athletes with no recap, or whose most recent recap is `days`+ old. Most-overdue first.
export function dueAthletes(athletes, days = DUE_DAYS, now = Date.now()) {
  const threshold = days * 86400000;
  return athletes
    .map((a) => ({ athlete: a, lastTs: lastRecapTime(a) }))
    .filter(({ lastTs }) => lastTs === null || now - lastTs >= threshold)
    .sort((a, b) => (a.lastTs ?? -Infinity) - (b.lastTs ?? -Infinity));
}
