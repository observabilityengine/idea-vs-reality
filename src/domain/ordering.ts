import type { Memory } from './memory';

const FALLBACK_MINUTE = 12 * 60;

export function orderMemories(memories: Memory[]): Memory[] {
  return [...memories].sort((a, b) => {
    const appointmentA = a.appointmentAt ? 0 : 1;
    const appointmentB = b.appointmentAt ? 0 : 1;
    if (appointmentA !== appointmentB) return appointmentA - appointmentB;

    if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;

    const minuteA = a.inferredMinute ?? FALLBACK_MINUTE;
    const minuteB = b.inferredMinute ?? FALLBACK_MINUTE;
    if (minuteA !== minuteB) return minuteA - minuteB;

    return a.createdAt.localeCompare(b.createdAt);
  });
}
