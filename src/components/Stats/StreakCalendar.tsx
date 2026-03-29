import { useMemo } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { computeStreak } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

export function StreakCalendar() {
  const { tasks } = useTasks();

  const { current, longest, days } = useMemo(() => computeStreak(tasks), [tasks]);

  const weeks: { date: Date; hasActivity: boolean }[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 83);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  for (let w = 0; w < 12; w++) {
    const week: { date: Date; hasActivity: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = date.toISOString().split('T')[0];
      week.push({ date, hasActivity: days.has(key) });
    }
    weeks.push(week);
  }

  return (
    <StatCard title="Productivity Streak" value={current} unit={`day streak (best: ${longest})`}>
      <div className="streak-container">
        <div className="streak-grid">
          {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
            <span key={i} className="streak-day-label">{d}</span>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className={`streak-cell ${day.hasActivity ? 'active' : ''} ${day.date > today ? 'future' : ''}`}
                title={`${day.date.toLocaleDateString()}${day.hasActivity ? ' — ✓' : ''}`}
              />
            ))
          )}
        </div>
        <div className="streak-legend">
          <span className="streak-legend-label">Less</span>
          <div className="streak-cell" />
          <div className="streak-cell active" />
          <span className="streak-legend-label">More</span>
        </div>
      </div>
      <style>{`
        .streak-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .streak-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: repeat(7, 1fr);
          gap: 3px;
          width: 100%;
        }
        .streak-day-label {
          font-size: 9px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .streak-cell {
          aspect-ratio: 1;
          border-radius: 2px;
          background: var(--bg-tertiary);
          min-height: 12px;
        }
        .streak-cell.active {
          background: var(--success);
        }
        .streak-cell.future {
          opacity: 0.3;
        }
        .streak-legend {
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-end;
        }
        .streak-legend-label {
          font-size: 9px;
          color: var(--text-muted);
        }
        .streak-legend .streak-cell {
          width: 12px;
          height: 12px;
        }
      `}</style>
    </StatCard>
  );
}
