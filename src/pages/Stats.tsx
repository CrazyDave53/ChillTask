import { useState } from 'react';
import { StatsPeriod } from '../utils/statsUtils';
import { CompletionChart } from '../components/Stats/CompletionChart';
import { StreakCalendar } from '../components/Stats/StreakCalendar';
import { GroupBreakdownChart } from '../components/Stats/GroupBreakdownChart';
import { DeadlineAdherenceChart } from '../components/Stats/DeadlineAdherenceChart';
import { VolumeChart } from '../components/Stats/VolumeChart';
import { TasksAddedChart } from '../components/Stats/TasksAddedChart';
import { EmptyState } from '../components/EmptyState';
import { useTasks } from '../hooks/useTasks';

export function Stats() {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState<StatsPeriod>('7d');

  const hasData = tasks.some((t) => t.isArchived);

  return (
    <div className="page stats-page">
      <h1>Stats</h1>

      <div className="period-tabs">
        {([
          { key: '7d', label: '7 Days' },
          { key: '30d', label: '30 Days' },
          { key: 'all', label: 'All Time' },
        ] as { key: StatsPeriod; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            className={period === key ? 'active' : ''}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <EmptyState message="No data yet — complete some tasks to see your stats!" />
      ) : (
        <div className="stats-grid">
          <CompletionChart period={period} />
          <StreakCalendar />
          <GroupBreakdownChart period={period} />
          <DeadlineAdherenceChart period={period} />
          <VolumeChart period={period} />
          <TasksAddedChart period={period} />
        </div>
      )}

      <style>{`
        .period-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius);
          width: fit-content;
        }
        .period-tabs button {
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          background: none;
          color: var(--text-muted);
          font-size: 0.875rem;
          transition: background 0.15s, color 0.15s;
        }
        .period-tabs button:hover {
          color: var(--text-primary);
        }
        .period-tabs button.active {
          background: var(--bg-tertiary);
          color: var(--accent);
          font-weight: 500;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
