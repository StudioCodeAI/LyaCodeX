export type MemoryCategory =
  | 'decision'
  | 'session_summary'
  | 'project_preference'
  | 'command_history'
  | 'error_pattern';

export interface MemoryEvent {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  source: string;
  createdAt: string;
}

export function createMemoryEvent(input: Omit<MemoryEvent, 'id' | 'createdAt'>): MemoryEvent {
  return {
    ...input,
    id: `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
}

