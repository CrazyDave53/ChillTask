import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { StatsPeriod, getDateRange, getPeriodKey } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

interface TasksAddedChartProps {
  period: StatsPeriod;
}

export function TasksAddedChart({ period }: TasksAddedChartProps) {
  const { tasks } = useTasks();

  const data = useMemo(() => {
    const { start, end } = getDateRange(period);
    const activeTasks = tasks.filter((t) => t.isActive || !!t.createdAt);
    const map: Record<string, number> = {};

    activeTasks.forEach((t) => {
      const d = new Date(t.createdAt);
      if (d < start || d > end) return;
      const key = getPeriodKey(d, period);
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, tasks: value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, period]);

  return (
    <StatCard title="Tasks Added" value={data.reduce((s, d) => s + d.tasks, 0)} unit="tasks">
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
            <Bar dataKey="tasks" name="Tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </StatCard>
  );
}
