export type MemoryStatus = 'active' | 'completed';

export interface Memory {
  id: string;
  text: string;
  status: MemoryStatus;
  createdAt: string;
  completedAt: string | null;
  appointmentAt: string | null;
  isImportant: boolean;
  inferredMinute: number | null;
}

export interface NewMemory {
  text: string;
  appointmentAt: string | null;
  isImportant: boolean;
  inferredMinute: number | null;
}
