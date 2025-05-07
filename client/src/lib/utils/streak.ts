import { TaskCompletion } from "@shared/schema";

/**
 * Calculate the current streak for a set of task completions
 * @param completions Array of task completions
 * @returns Current streak count
 */
export function calculateCurrentStreak(completions: TaskCompletion[]): number {
  if (!completions.length) return 0;
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Sort completions by date, newest first
  const sortedCompletions = [...completions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Check if there's a completion for today
  const todayCompletion = sortedCompletions.find(c => c.date === todayStr);
  if (!todayCompletion || !todayCompletion.completed) return 0;
  
  // Start counting streak from today
  let streak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;
  let prevDate = today;
  
  // Check previous days
  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDayDate = new Date(prevDate.getTime() - oneDayMs);
    const prevDayStr = prevDayDate.toISOString().split('T')[0];
    
    const completion = sortedCompletions.find(c => c.date === prevDayStr);
    
    if (completion && completion.completed) {
      streak++;
      prevDate = prevDayDate;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate the longest streak for a set of task completions
 * @param completions Array of task completions
 * @returns Longest streak count
 */
export function calculateLongestStreak(completions: TaskCompletion[]): number {
  if (!completions.length) return 0;
  
  // Filter out incomplete days and sort by date
  const completedDays = completions
    .filter(c => c.completed)
    .map(c => new Date(c.date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (!completedDays.length) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < completedDays.length; i++) {
    const prevDate = completedDays[i - 1];
    const currDate = completedDays[i];
    
    // Calculate days between dates
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day, increment streak
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      // Streak broken
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}

/**
 * Calculate the completion rate over a period
 * @param completions Array of task completions
 * @param days Number of days to consider (default 30)
 * @returns Completion rate as a percentage
 */
export function calculateCompletionRate(completions: TaskCompletion[], days = 30): number {
  if (!completions.length) return 0;
  
  // Get cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // Filter completions to only include those from the last N days
  const recentCompletions = completions.filter(c => 
    new Date(c.date) >= cutoffDate
  );
  
  if (!recentCompletions.length) return 0;
  
  // Count completed days
  const completedDays = recentCompletions.filter(c => c.completed).length;
  
  // Calculate rate
  return Math.round((completedDays / recentCompletions.length) * 100);
}
