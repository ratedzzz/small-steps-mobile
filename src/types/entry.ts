// src/types/entry.ts
export type Entry = {
  id: string;          // string everywhere for consistency
  date: string;        // YYYY-MM-DD
  text?: string;
  habitId?: string;    // undefined for general (free-form) journal entries
  createdAtISO?: string;
  updatedAtISO?: string;
};
