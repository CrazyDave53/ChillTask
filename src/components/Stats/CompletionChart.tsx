import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { StatsPeriod, getDateRange, getPeriodKey } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

interface CompletionChartProps {
  period: StatsPeriod;
}

export function CompletionChart({ period }: CompletionChartProps) {
  const { tasks } = useTasks();

  const data = useMemo(() => {
    const { start, end } = getDateRange(period);
    const archived = tasks.filter((t) => t.isArchived && t.archivedAt);

    const map: Record<string, { done: number; skipped: number }> = {};

    archived.forEach((t) => {
      if (!t.archivedAt) return;
      const d = new Date(t.archivedAt);
      if (d < start || d > end) return;
      const key = getPeriodKey(d, period);
      if (!map[key]) map[key] = { done: 0, skipped: 0 };
      map[key][t.archiveStatus === 'done' ? 'done' : 'skipped']++;
    });

    return Object.entries(map)
      .map(([name, v]) => ({ name, done: v.done, skipped: v.skipped }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, period]);

  const totalDone = data.reduce((s, d) => s + d.done, 0);
  const totalSkipped = data.reduce((s, d) => s + d.skipped, 0);

  return (
    <StatCard title="Completion Rate" value={totalDone} unit={`done (${totalSkipped} skipped)`}>
      {data.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1e1e32', border: '1px solid #2d2d4a', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            <Bar dataKey="done" name="Done" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="skipped" name="Skipped" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </StatCard>
  );
}
