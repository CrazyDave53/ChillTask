import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTasks, useGroups } from '../../hooks';
import { StatsPeriod, getDateRange } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface GroupBreakdownChartProps {
  period: StatsPeriod;
}

export function GroupBreakdownChart({ period }: GroupBreakdownChartProps) {
  const { tasks } = useTasks();
  const { groups } = useGroups();

  const data = useMemo(() => {
    const { start, end } = getDateRange(period);
    const archived = tasks.filter((t) => t.isArchived && t.archivedAt);
    const filtered = archived.filter((t) => {
      if (!t.archivedAt) return false;
      const d = new Date(t.archivedAt);
      return d >= start && d <= end;
    });

    const map: Record<string, number> = {};
    filtered.forEach((t) => {
      const key = t.groupId ? (groups.find((g) => g.id === t.groupId)?.name || 'Uncategorized') : 'Uncategorized';
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks, groups, period]);

  return (
    <StatCard title="Group Breakdown" value={data.length} unit="groups">
      {data.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e1e32', border: '1px solid #2d2d4a', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </StatCard>
  );
}
