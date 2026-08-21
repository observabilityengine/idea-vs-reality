import { parseMemory } from '../src/domain/parser';

describe('parseMemory', () => {
  it('removes the internal important instruction', () => {
    expect(parseMemory("Important — call Toby's Eats", new Date('2026-08-21T10:00:00'))).toMatchObject({
      text: "call Toby's Eats",
      isImportant: true,
    });
  });

  it('parses an explicit appointment date and time without displaying the date text', () => {
    const result = parseMemory("Doctor's appointment June 12th at 1 PM", new Date('2026-06-01T10:00:00'));
    expect(result?.appointmentAt).toBeTruthy();
    expect(result?.text).toBe("Doctor's appointment");
  });

  it('does not invent scheduling metadata for an ordinary memory', () => {
    expect(parseMemory('Do my taxes', new Date('2026-08-21T10:00:00'))?.appointmentAt).toBeNull();
  });
});
