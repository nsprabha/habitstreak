/**
 * Get the ISO date string (YYYY-MM-DD) for the current day
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the ISO date string for a specific day in the past
 * @param daysAgo Number of days in the past (0 = today, 1 = yesterday, etc.)
 */
export function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Get an array of ISO date strings for the last N days
 * @param days Number of days to include
 * @returns Array of date strings, newest first
 */
export function getLastNDays(days: number): string[] {
  return Array.from({ length: days }, (_, i) => getDateString(i));
}

/**
 * Formats a date string (YYYY-MM-DD) to a more readable format
 * @param dateStr ISO date string
 * @param format Format option: 'short' = 'Mon, Jan 1', 'long' = 'Monday, January 1, 2023'
 */
export function formatDate(dateStr: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateStr);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

/**
 * Checks if a date is today
 * @param dateStr ISO date string
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Calculate the difference in days between two date strings
 * @param date1 First date string
 * @param date2 Second date string
 * @returns Number of days between the dates (positive if date2 is later)
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
