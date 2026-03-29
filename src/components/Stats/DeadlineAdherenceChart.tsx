import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { StatsPeriod, getDateRange, getPeriodKey, isOnTime } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

interface DeadlineAdherenceChartProps {
  period: StatsPeriod;
}

export function DeadlineAdherenceChart({ period }: DeadlineAdherenceChartProps) {
  const { tasks } = useTasks();

  const data = useMemo(() => {
    const { start, end } = getDateRange(period);
    const archived = tasks.filter((t) => t.isArchived && t.archivedAt && t.deadline);
    const filtered = archived.filter((t) => {
      if (!t.archivedAt) return false;
      const d = new Date(t.archivedAt);
      return d >= start && d <= end;
    });

    const map: Record<string, { onTime: number; late: number }> = {};
    filtered.forEach((t) => {
      if (!t.archivedAt) return;
      const d = new Date(t.archivedAt);
      const key = getPeriodKey(d, period);
      if (!map[key]) map[key] = { onTime: 0, late: 0 };
      if (isOnTime(t)) map[key].onTime++;
      else map[key].late++;
    });

    return Object.entries(map)
      .map(([name, v]) => ({ name, onTime: v.onTime, late: v.late }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, period]);

  const totalOnTime = data.reduce((s, d) => s + d.onTime, 0);

  return (
    <StatCard title="Deadline Adherence" value={totalOnTime} unit="on time">
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
            <Bar dataKey="onTime" name="On Time" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name="Late" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </StatCard>
  );
}
