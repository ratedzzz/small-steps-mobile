const QUOTES = [
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Rome was not built in a day, but they were laying bricks every hour.', author: 'John Heywood' },
  { text: 'Motivation gets you going, but habit keeps you growing.', author: 'John C. Maxwell' },
];

export function quoteForDate(dateISO: string) {
  const dayIndex = Math.abs(Array.from(dateISO).reduce((a,c)=> a + c.charCodeAt(0), 0));
  return QUOTES[dayIndex % QUOTES.length];
}
