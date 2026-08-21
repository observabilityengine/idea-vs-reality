import { validateMemory } from '../src/domain/validation';

describe('validateMemory', () => {
  const base = {
    text: '  Buy   milk  ',
    appointmentAt: null,
    isImportant: false,
    inferredMinute: null,
  };

  it('normalizes whitespace', () => {
    expect(validateMemory(base)?.text).toBe('Buy milk');
  });

  it('rejects empty text', () => {
    expect(validateMemory({ ...base, text: '   ' })).toBeNull();
  });

  it('rejects oversized text', () => {
    expect(validateMemory({ ...base, text: 'x'.repeat(501) })).toBeNull();
  });
});
