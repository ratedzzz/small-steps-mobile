// src/utils.ts

export const getLocalDate = (): string => {
  const now = new Date();
  // Subtract the timezone offset to get the correct local time
  const offset = now.getTimezoneOffset() * 60000; 
  const localTime = new Date(now.getTime() - offset);
  return localTime.toISOString().split("T")[0];
};