import type { Memory } from '../src/domain/memory';
import { orderMemories } from '../src/domain/ordering';

const memory = (overrides: Partial<Memory>): Memory => ({
  id: 'id',
  text: 'memory',
  status: 'active',
  createdAt: '2026-08-21T10:00:00.000Z',
  completedAt: null,
  appointmentAt: null,
  isImportant: false,
  inferredMinute: null,
  ...overrides,
});

describe('orderMemories', () => {
  it('places appointments first, then important memories', () => {
    const result = orderMemories([
      memory({ id: 'ordinary' }),
      memory({ id: 'important', isImportant: true }),
      memory({ id: 'appointment', appointmentAt: '2026-08-22T13:00:00.000Z' }),
    ]);
    expect(result.map(item => item.id)).toEqual(['appointment', 'important', 'ordinary']);
  });

  it('uses inferred time for ordinary memories', () => {
    const result = orderMemories([
      memory({ id: 'dinner', inferredMinute: 18 * 60 }),
      memory({ id: 'bed', inferredMinute: 8 * 60 }),
    ]);
    expect(result.map(item => item.id)).toEqual(['bed', 'dinner']);
  });
});
