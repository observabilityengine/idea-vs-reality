import * as chrono from 'chrono-node';
import type { NewMemory } from './memory';

const IMPORTANT_PREFIX = /^\s*important\s*(?:[-:—–]\s*|,\s*|\s+)/i;
const APPOINTMENT_WORDS = /\b(appointment|meeting|reservation|booking)\b/i;
const MORNING_WORDS = /\b(make my bed|breakfast|morning|shower|wake up|coffee)\b/i;
const EVENING_WORDS = /\b(make dinner|dinner|supper|evening|bedtime|go to bed)\b/i;

function inferMinute(text: string): number | null {
  if (MORNING_WORDS.test(text)) return 8 * 60;
  if (EVENING_WORDS.test(text)) return 18 * 60;
  return null;
}

function parseAppointment(text: string, now: Date): { appointmentAt: string | null; visibleText: string } {
  if (!APPOINTMENT_WORDS.test(text)) return { appointmentAt: null, visibleText: text };

  const results = chrono.parse(text, now, { forwardDate: true });
  if (results.length === 0) return { appointmentAt: null, visibleText: text };

  const result = results[0];
  const date = result.start.date();
  if (Number.isNaN(date.getTime())) return { appointmentAt: null, visibleText: text };

  const visibleText = text
    .replace(result.text, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();

  return { appointmentAt: date.toISOString(), visibleText: visibleText || text };
}

export function parseMemory(input: string, now = new Date()): NewMemory | null {
  const normalized = input.trim().replace(/\s+/g, ' ');
  if (!normalized) return null;

  const isImportant = IMPORTANT_PREFIX.test(normalized);
  const visibleText = normalized.replace(IMPORTANT_PREFIX, '').trim();
  if (!visibleText) return null;

  const appointment = parseAppointment(visibleText, now);

  return {
    text: appointment.visibleText,
    appointmentAt: appointment.appointmentAt,
    isImportant,
    inferredMinute: appointment.appointmentAt ? null : inferMinute(visibleText),
  };
}
