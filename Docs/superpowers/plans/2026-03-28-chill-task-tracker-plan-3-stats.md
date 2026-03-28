# Chill Task Tracker — Plan 3: Stats & Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Stats page with 6 charts using Recharts, configure PWA (service worker, manifest), set up Tauri for Windows desktop, and add Firestore security rules.

**Depends on:** Plan 1 (Foundation) and Plan 2 (Views & UI)

---

## File Structure (new/modified)

```
public/
├── manifest.json            # PWA manifest
├── sw.js                   # Service worker
src/
├── pages/
│   └── Stats.tsx           # Full implementation (replace stub)
├── components/
│   └── Stats/
│       ├── CompletionChart.tsx
│       ├── StreakCalendar.tsx
│       ├── GroupBreakdownChart.tsx
│       ├── DeadlineAdherenceChart.tsx
│       ├── VolumeChart.tsx
│       └── ActiveSessionsChart.tsx
├── utils/
│   └── statsUtils.ts       # Shared date/stat computation helpers
├── components/
│   └── Stats/
│       └── StatCard.tsx    # Shared card wrapper for stats
src-tauri/
├── src/main.rs             # Tauri entry point
├── tauri.conf.json         # Tauri config
├── Cargo.toml
src/
├── App.tsx                 # Update for PWA service worker registration
vite.config.ts              # Update for PWA build
firestore.rules             # Security rules
```

---

## Tasks

### Task 1: Stats Utilities

**Files:**
- Create: `src/utils/statsUtils.ts`

- [ ] **Step 1: Create `src/utils/statsUtils.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/statsUtils.ts
git commit -m "feat: add stats computation utilities"
```

---

### Task 2: StatCard Component

**Files:**
- Create: `src/components/Stats/StatCard.tsx`

- [ ] **Step 1: Create `src/components/Stats/StatCard.tsx`**

```tsx
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value?: string | number;
  unit?: string;
  children: ReactNode;
}

export function StatCard({ title, value, unit, children }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {(value !== undefined) && (
          <span className="stat-value">
            {value}{unit && <span className="stat-unit">{unit}</span>}
          </span>
        )}
      </div>
      <div className="stat-body">{children}</div>
      <style>{`
        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
        }
        .stat-title {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .stat-unit {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--text-muted);
          margin-left: 2px;
        }
        .stat-body {
          /* chart goes here */
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Stats/StatCard.tsx
git commit -m "feat: add StatCard component"
```

---

### Task 3: Completion & Volume Charts

**Files:**
- Create: `src/components/Stats/CompletionChart.tsx`
- Create: `src/components/Stats/VolumeChart.tsx`

- [ ] **Step 1: Create `src/components/Stats/CompletionChart.tsx`**

```tsx
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
    const added = tasks.filter((t) => t.createdAt);

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
```

- [ ] **Step 2: Create `src/components/Stats/VolumeChart.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Stats/CompletionChart.tsx src/components/Stats/VolumeChart.tsx
git commit -m "feat: add completion rate and volume charts"
```

---

### Task 4: Group Breakdown & Deadline Adherence Charts

**Files:**
- Create: `src/components/Stats/GroupBreakdownChart.tsx`
- Create: `src/components/Stats/DeadlineAdherenceChart.tsx`

- [ ] **Step 1: Create `src/components/Stats/GroupBreakdownChart.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `src/components/Stats/DeadlineAdherenceChart.tsx`**

```tsx
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

  return (
    <StatCard title="Deadline Adherence" value={data.reduce((s, d) => s + d.onTime, 0)} unit="on time">
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Stats/GroupBreakdownChart.tsx src/components/Stats/DeadlineAdherenceChart.tsx
git commit -m "feat: add group breakdown and deadline adherence charts"
```

---

### Task 5: Streak & Active Sessions Charts

**Files:**
- Create: `src/components/Stats/StreakCalendar.tsx`
- Create: `src/components/Stats/ActiveSessionsChart.tsx`

- [ ] **Step 1: Create `src/components/Stats/StreakCalendar.tsx`**

```tsx
import { useMemo } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { computeStreak } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

export function StreakCalendar() {
  const { tasks } = useTasks();

  const { current, longest, days } = useMemo(() => computeStreak(tasks), [tasks]);

  // Generate last 12 weeks of days
  const weeks: { date: Date; hasActivity: boolean }[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 83); // ~12 weeks back, start on Monday

  // Align to Monday
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
```

- [ ] **Step 2: Create `src/components/Stats/ActiveSessionsChart.tsx`**

```tsx
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { StatsPeriod, getDateRange, getPeriodKey } from '../../utils/statsUtils';
import { StatCard } from './StatCard';

interface ActiveSessionsChartProps {
  period: StatsPeriod;
}

export function ActiveSessionsChart({ period }: ActiveSessionsChartProps) {
  const { tasks } = useTasks();

  const data = useMemo(() => {
    const { start, end } = getDateRange(period);
    // Note: "Active Sessions" measures tasks that were in the active session.
    // v1 simplification: counts tasks by their createdAt timestamp.
    // A more accurate approach would track isActive transitions in Firestore.
    const activeTasks = tasks.filter((t) => t.isActive || (t.createdAt));
    const map: Record<string, number> = {};

    // Use createdAt as when task was added to session
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Stats/StreakCalendar.tsx src/components/Stats/ActiveSessionsChart.tsx
git commit -m "feat: add streak calendar and active sessions chart"
```

---

### Task 6: Stats Page

**Files:**
- Modify: `src/pages/Stats.tsx` (replace stub)

- [ ] **Step 1: Implement `src/pages/Stats.tsx`**

```tsx
import { useState } from 'react';
import { StatsPeriod } from '../utils/statsUtils';
import { CompletionChart } from '../components/Stats/CompletionChart';
import { StreakCalendar } from '../components/Stats/StreakCalendar';
import { GroupBreakdownChart } from '../components/Stats/GroupBreakdownChart';
import { DeadlineAdherenceChart } from '../components/Stats/DeadlineAdherenceChart';
import { VolumeChart } from '../components/Stats/VolumeChart';
import { ActiveSessionsChart } from '../components/Stats/ActiveSessionsChart';
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
          <ActiveSessionsChart period={period} />
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Stats.tsx
git commit -m "feat: implement Stats page with all 6 charts"
```

---

### Task 7: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "ChillTask",
  "short_name": "ChillTask",
  "description": "Minimal task tracker for students",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1a",
  "theme_color": "#0f0f1a",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Create `public/sw.js`** (service worker for offline caching)

```js
const CACHE_NAME = 'chilltask-v1';
const ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
```

- [ ] **Step 3: Create placeholder icons**

Generate simple placeholder PNG icons (or create via canvas). For now, create 1x1 transparent PNGs as placeholders:
- `public/icon-192.png`
- `public/icon-512.png`

(These should be replaced with proper app icons in a future iteration.)

```bash
# Create minimal placeholder icons (1x1 PNG)
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > public/icon-192.png
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > public/icon-512.png
```

- [ ] **Step 4: Register service worker in `src/main.tsx`**

```tsx
// Add after ReactDOM.createRoot:
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app still works
    });
  });
}
```

Update the existing `src/main.tsx` from Plan 1.

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/sw.js public/icon-192.png public/icon-512.png
git add src/main.tsx
git commit -m "feat: add PWA manifest, service worker, and icons"
```

---

### Task 8: Tauri Desktop Setup

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/icons/icon.png` (placeholder)

- [ ] **Step 1: Create `src-tauri/Cargo.toml`**

```toml
[package]
name = "chill-task-tracker"
version = "0.1.0"
description = "ChillTask — Minimal task tracker"
authors = ["you"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.6", features = ["shell-open"] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

- [ ] **Step 2: Create `src-tauri/tauri.conf.json`**

```json
{
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:3000",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "package": {
    "productName": "ChillTask",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "open": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.chilltask.app",
      "icon": [
        "icons/icon.png"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "ChillTask",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

- [ ] **Step 3: Create `src-tauri/src/main.rs`**

```rust
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4: Create `src-tauri/build.rs`**

```rust
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 5: Create placeholder icon**

```bash
# Create minimal placeholder icon
mkdir -p src-tauri/icons
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > src-tauri/icons/icon.png
```

- [ ] **Step 6: Add GitHub Actions CI for GitHub Pages and Tauri**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

  tauri:
    runs-on: ubuntu-latest
    needs: web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: dtolnay/rust-toolchain@stable
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 7: Commit**

```bash
git add src-tauri/Cargo.toml src-tauri/tauri.conf.json src-tauri/src/main.rs src-tauri/build.rs src-tauri/icons/icon.png
git add .github/workflows/deploy.yml
git commit -m "feat: add Tauri desktop wrapper with CI"
```

---

### Task 9: Firestore Security Rules

**Files:**
- Create: `firestore.rules`

- [ ] **Step 1: Create `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: get the current user's UID
    function isSignedIn() {
      return request.auth != null;
    }

    function userId() {
      return request.auth.uid;
    }

    // Tasks: user can only read/write their own tasks
    match /tasks/{taskId} {
      allow read: if isSignedIn() && resource.data.userId == userId();
      allow create: if isSignedIn() && request.resource.data.userId == userId();
      allow update, delete: if isSignedIn() && resource.data.userId == userId();
    }

    // Groups: user can only read/write their own groups
    match /groups/{groupId} {
      allow read: if isSignedIn() && resource.data.userId == userId();
      allow create: if isSignedIn() && request.resource.data.userId == userId();
      allow update, delete: if isSignedIn() && resource.data.userId == userId();
    }
  }
}
```

- [ ] **Step 2: Deploy instructions in README**

Add to the project README:

```markdown
## Deploy Firestore Security Rules

After setting up Firebase:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (select Firestore, use existing project)
4. Copy `firestore.rules` to the Firebase project
5. Deploy: `firebase deploy --only firestore:rules`
```

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "chore: add Firestore security rules"
```

---

### Task 10: Build & Verify

- [ ] **Step 1: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify web build**

Run: `npm run build`
Expected: `dist/` folder with static assets

- [ ] **Step 3: Test PWA manifest**

Open `dist/index.html` in browser and verify manifest link exists.

- [ ] **Step 4: Test Tauri build** (if Rust toolchain is available)

Run: `npm run tauri build`
Expected: `src-tauri/target/release/` contains the `.exe`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Plan 3 — stats, PWA, Tauri, and security rules"
```

---

## After Plan 3

The app is complete and production-ready:
- All 6 stat charts across 3 time ranges
- PWA installable on Android
- Tauri builds a Windows `.exe`
- GitHub Pages deploys the web version
- Firestore security rules protect user data
- GitHub Actions CI handles deploys automatically
