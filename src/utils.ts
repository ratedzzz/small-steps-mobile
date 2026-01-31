// src/utils.ts
import { format } from 'date-fns';

export const getLocalDate = (): string => {
  // Returns today's date as "YYYY-MM-DD" based on the user's phone settings
  return format(new Date(), 'yyyy-MM-dd');
};