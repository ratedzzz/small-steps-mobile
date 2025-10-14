// src/quotes.ts - Daily motivational quotes
export const MOTIVATIONAL_QUOTES = [
  "Small steps lead to big changes.",
  "Progress, not perfection.",
  "One day at a time.",
  "You are capable of amazing things.",
  "Every journey begins with a single step.",
  "Consistency is the key to success.",
  "Your future self will thank you.",
  "Small improvements add up to big results.",
  "Focus on progress, not perfection.",
  "Believe in yourself and take action.",
  "Today is a new opportunity.",
  "Start where you are. Use what you have.",
  "The secret of getting ahead is getting started.",
  "Dream big, start small, act now.",
  "Success is the sum of small efforts repeated.",
  "You don't have to be great to start, but you have to start to be great.",
  "A journey of a thousand miles begins with a single step.",
  "The only impossible journey is the one you never begin.",
  "Motivation gets you started. Habit keeps you going.",
  "Change might not be fast, but it will be worth it.",
  "Your only limit is you.",
  "Don't watch the clock; do what it does. Keep going.",
  "Start small, dream big, keep going.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Be stronger than your excuses.",
  "Little by little, one travels far.",
  "The key is to keep company only with people who uplift you.",
  "You are never too old to set another goal.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
];

/**
 * Get a motivational quote for today
 * Uses the current date to pick a consistent quote for the day
 */
export function getMotivationalQuote(): string {
  const index = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}