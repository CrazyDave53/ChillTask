import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { ArchiveFilter, ArchivePeriod } from '../types';
import { TaskList } from '../components/TaskList';
import { EmptyState } from '../components/EmptyState';

export function Archived() {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState<ArchivePeriod>('week');
  const [filter, setFilter] = useState<ArchiveFilter>('all');

  const archivedTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.isArchived);
    if (filter !== 'all') {
      filtered = filtered.filter((t) => t.archiveStatus === filter);
    }
    return filtered.sort((a, b) => {
      const at = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
      const bt = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
      return bt - at;
    });
  }, [tasks, filter]);

  const groupedTasks = useMemo(() => {
    const map: Record<string, typeof archivedTasks> = {};
    archivedTasks.forEach((task) => {
      if (!task.archivedAt) {
        (map['Unknown'] = map['Unknown'] || []).push(task);
        return;
      }
      const d = new Date(task.archivedAt);
      let key: string;
      if (period === 'week') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
        thisWeekStart.setHours(0, 0, 0, 0);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        if (startOfWeek.getTime() >= thisWeekStart.getTime()) key = 'This Week';
        else if (startOfWeek.getTime() >= lastWeekStart.getTime()) key = 'Last Week';
        else key = startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } else {
        key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      (map[key] = map[key] || []).push(task);
    });
    return map;
  }, [archivedTasks, period]);

  return (
    <div className="page archived-page">
      <h1>Archived</h1>

      <div className="archived-controls">
        <div className="filter-tabs">
          {(['all', 'done', 'skipped'] as ArchiveFilter[]).map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="period-toggle">
          <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>Week</button>
          <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Month</button>
        </div>
      </div>

      {archivedTasks.length === 0 ? (
        <EmptyState message="Nothing here yet — go crush some tasks!" />
      ) : (
        Object.entries(groupedTasks).map(([group, groupTasks]) => (
          <TaskList
            key={group}
            title={group}
            tasks={groupTasks}
            compact
          />
        ))
      )}

      <style>{`
        .archived-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .filter-tabs, .period-toggle {
          display: flex;
          gap: 4px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius);
        }
        .filter-tabs button, .period-toggle button {
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          transition: background 0.15s, color 0.15s;
        }
        .filter-tabs button:hover, .period-toggle button:hover {
          color: var(--text-primary);
        }
        .filter-tabs button.active, .period-toggle button.active {
          background: var(--bg-tertiary);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
