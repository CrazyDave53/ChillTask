import { Task } from '../types';

export type StatsPeriod = '7d' | '30d' | 'all';

export function getDateRange(period: StatsPeriod): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (period === '7d') {
    start.setDate(start.getDate() - 6);
  } else if (period === '30d') {
    start.setDate(start.getDate() - 29);
  } else {
    start.setFullYear(2000, 0, 1);
  }
  return { start, end };
}

export function getPeriodKey(date: Date, period: StatsPeriod): string {
  if (period === '7d') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  if (period === '30d') {
    const weekNum = Math.ceil((date.getDate()) / 7);
    return `Week ${weekNum}`;
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function isOnTime(task: Task): boolean {
  if (!task.deadline || !task.archivedAt) return false;
  return new Date(task.archivedAt) <= new Date(task.deadline);
}

export function computeStreak(tasks: Task[]): { current: number; longest: number; days: Set<string> } {
  const doneTasks = tasks.filter((t) => t.isArchived && t.archiveStatus === 'done' && t.archivedAt);
  const days = new Set<string>();
  doneTasks.forEach((t) => {
    if (t.archivedAt) {
      const d = new Date(t.archivedAt);
      days.add(d.toISOString().split('T')[0]);
    }
  });

  const sortedDays = Array.from(days).sort();
  let current = 0;
  let longest = 0;
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const day = sortedDays[i];
    if (i === sortedDays.length - 1) {
      if (day === today || day === yesterday) {
        streak = 1;
        current = 1;
      } else {
        break;
      }
    } else {
      const prev = new Date(sortedDays[i + 1]);
      const curr = new Date(day);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
        if (current > 0) current = streak;
      } else {
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }
  }
  longest = Math.max(longest, streak);

  return { current, longest, days };
}
