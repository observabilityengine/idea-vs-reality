import { parseMemory } from '../src/domain/parser';

describe('parseMemory', () => {
  const now = new Date('2026-08-21T10:00:00');

  it('removes the internal important instruction', () => {
    expect(parseMemory("Important — call Toby's Eats", now)).toMatchObject({
      text: "call Toby's Eats",
      isImportant: true,
    });
  });

  it('recognizes important prefixes case-insensitively', () => {
    expect(parseMemory('IMPORTANT: renew passport', now)).toMatchObject({
      text: 'renew passport',
      isImportant: true,
    });
  });

  it('parses an explicit appointment date and time without displaying the date text', () => {
    const result = parseMemory("Doctor's appointment June 12th at 1 PM", new Date('2026-06-01T10:00:00'));
    expect(result?.appointmentAt).toBeTruthy();
    expect(result?.text).toBe("Doctor's appointment");
    expect(result?.appointmentAt).toContain('2026-06-12T13:00:00');
  });

  it('parses relative appointment dates from the supplied clock', () => {
    const result = parseMemory('Meeting tomorrow at 9 AM', now);
    expect(result?.appointmentAt).toContain('2026-08-22T09:00:00');
    expect(result?.text).toBe('Meeting');
  });

  it('infers morning and evening times when there is no appointment date', () => {
    expect(parseMemory('make my bed', now)?.inferredMinute).toBe(8 * 60);
    expect(parseMemory('make dinner', now)?.inferredMinute).toBe(18 * 60);
  });

  it('does not invent scheduling metadata for an ordinary memory', () => {
    expect(parseMemory('Do my taxes', now)).toMatchObject({
      appointmentAt: null,
      inferredMinute: null,
      isImportant: false,
    });
  });

  it('rejects blank input', () => {
    expect(parseMemory('   ', now)).toBeNull();
  });
});
