// All wall-clock reasoning in the app is anchored to Malaysia time so the
// dashboard reads identically no matter where it runs — your PC (UTC+8) or a
// Vercel serverless region (UTC by default). Malaysia Standard Time has been a
// fixed UTC+8 with no daylight saving since 1982, so a constant offset is both
// simpler and safer than relying on the host process timezone.
const KL_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Kuala Lumpur wall-clock parts for the given instant (defaults to now). */
export function klParts(at: Date = new Date()) {
  const shifted = new Date(at.getTime() + KL_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/** Current KL wall-clock time as a fractional hour of the day (e.g. 19.55 for 7:33 PM). */
export function getNowHourKl(): number {
  const { hour, minute } = klParts();
  return (hour % 24) + minute / 60;
}

/** Integer key for a KL calendar day (e.g. 20260819), offset by whole days. */
export function klDateKey(dayOffset = 0): number {
  const { year, month, day } = klParts(new Date(Date.now() + dayOffset * 86_400_000));
  return year * 10000 + month * 100 + day;
}

/** ISO instant for a fractional hour of today's KL calendar day, pinned to UTC+8. */
export function klHourToIso(hour: number): string {
  const { year, month, day } = klParts();
  const midnightUtcAsIfKl = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const ms = midnightUtcAsIfKl + Math.round(hour * 60) * 60_000 - KL_OFFSET_MS;
  return new Date(ms).toISOString();
}
