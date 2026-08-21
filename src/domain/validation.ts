import type { NewMemory } from './memory';

const MAX_MEMORY_LENGTH = 500;

export function validateMemory(memory: NewMemory): NewMemory | null {
  const text = memory.text.trim().replace(/\s+/g, ' ');
  if (!text || text.length > MAX_MEMORY_LENGTH) return null;

  return {
    ...memory,
    text,
  };
}

export const MEMORY_LIMITS = {
  maxTextLength: MAX_MEMORY_LENGTH,
} as const;
