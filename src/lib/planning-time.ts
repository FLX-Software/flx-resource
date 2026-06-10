export const MINUTES_PER_DAY = 1440;
export const SNAP_MINUTES = 30;
export const MIN_ASSIGNMENT_MINUTES = 60;
export const DEFAULT_START_MINUTES = 480; // 08:00
export const DEFAULT_END_MINUTES = 1020; // 17:00
export const DROP_DURATION_MINUTES = 120; // 2 Stunden

export function snapMinutes(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

export function clampMinutes(minutes: number): number {
  return Math.max(0, Math.min(MINUTES_PER_DAY, minutes));
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return DEFAULT_START_MINUTES;
  return clampMinutes(h * 60 + m);
}

export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  return `${minutesToTime(startMinutes)} – ${minutesToTime(endMinutes)}`;
}

export function minutesFromTimelineX(
  clientX: number,
  rect: DOMRect
): number {
  const ratio = (clientX - rect.left) / rect.width;
  return snapMinutes(clampMinutes(Math.round(ratio * MINUTES_PER_DAY)));
}

export function timelinePercent(startMinutes: number, endMinutes: number) {
  return {
    left: (startMinutes / MINUTES_PER_DAY) * 100,
    width: ((endMinutes - startMinutes) / MINUTES_PER_DAY) * 100,
  };
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function normalizeRange(
  startMinutes: number,
  endMinutes: number
): { startMinutes: number; endMinutes: number } {
  let start = snapMinutes(clampMinutes(startMinutes));
  let end = snapMinutes(clampMinutes(endMinutes));

  if (end - start < MIN_ASSIGNMENT_MINUTES) {
    end = Math.min(MINUTES_PER_DAY, start + MIN_ASSIGNMENT_MINUTES);
  }

  if (end <= start) {
    end = Math.min(MINUTES_PER_DAY, start + MIN_ASSIGNMENT_MINUTES);
  }

  return { startMinutes: start, endMinutes: end };
}
