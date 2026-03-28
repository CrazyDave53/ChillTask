export interface Task {
  id: string;
  title: string;
  deadline: string | null;
  groupId: string | null;
  isActive: boolean;
  isArchived: boolean;
  archiveStatus: 'done' | 'skipped' | null;
  archivedAt: string | null;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  order: number;
  userId?: string;
}

export type GroupingMode = 'subject' | 'date' | 'deadline' | 'flat';
export type ArchivePeriod = 'week' | 'month';
export type ArchiveFilter = 'all' | 'done' | 'skipped';
export type StatsPeriod = '7d' | '30d' | 'all';
