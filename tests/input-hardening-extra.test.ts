import { validateMemory } from '../src/domain/validation';

test('validation trims and rejects empty values', () => {
  expect(validateMemory({ text: '  hello  ', appointmentAt: null, isImportant: false, inferredMinute: null })?.text).toBe('hello');
  expect(validateMemory({ text: ' ', appointmentAt: null, isImportant: false, inferredMinute: null })).toBeNull();
});
