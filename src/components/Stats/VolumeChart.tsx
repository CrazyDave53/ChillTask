import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { StatsPeriod, getDateRange, getPeriodKey } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

interface VolumeChartProps {
  period: StatsPeriod;
}

export function VolumeChart({ period }: VolumeChartProps) {
  const { tasks } = useTasks();

  const data = useMemo(() => {
    const { start, end } = getDateRange(period);
    const map: Record<string, { added: number; completed: number }> = {};

    tasks.forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      if (d < start || d > end) return;
      const key = getPeriodKey(d, period);
      if (!map[key]) map[key] = { added: 0, completed: 0 };
      map[key].added++;
    });

    tasks.filter((t) => t.isArchived && t.archivedAt).forEach((t) => {
      if (!t.archivedAt) return;
      const d = new Date(t.archivedAt);
      if (d < start || d > end) return;
      const key = getPeriodKey(d, period);
      if (!map[key]) map[key] = { added: 0, completed: 0 };
      map[key].completed++;
    });

    return Object.entries(map)
      .map(([name, v]) => ({ name, added: v.added, completed: v.completed }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, period]);

  return (
    <StatCard title="Volume" value={data.reduce((s, d) => s + d.added, 0)} unit="added">
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
            <Bar dataKey="added" name="Added" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </StatCard>
  );
}
