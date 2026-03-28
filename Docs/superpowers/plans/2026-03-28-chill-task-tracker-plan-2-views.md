# Chill Task Tracker — Plan 2: Views & UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all views with full task management — Home dashboard, Group tabs, Archived, Settings. Task cards with inline editing, add/remove from active, mark done/skipped, group CRUD.

**Architecture:** All views built from shared components. Task card component used across all views. Group-specific views reuse the same layout pattern. Data flows through the existing `useTasks` and `useGroups` hooks from Plan 1.

**Depends on:** Plan 1 (Foundation)

---

## File Structure (new/modified)

```
src/
├── components/
│   ├── TaskCard.tsx           # Shared task card component
│   ├── TaskList.tsx           # Renders a list of task cards
│   ├── AddTaskForm.tsx        # Inline add task input
│   ├── BacklogPanel.tsx       # Right panel backlog
│   └── EmptyState.tsx         # Motivational empty state component
├── pages/
│   ├── Home.tsx               # Full implementation
│   ├── Archived.tsx           # Full implementation
│   └── Settings.tsx          # Full implementation
└── styles/
    └── main.css               # Add card, panel, and form styles
```

---

## Shared Components

### TaskCard Component

**Files:**
- Create: `src/components/TaskCard.tsx`

The core building block. Used everywhere tasks are shown.

- [ ] **Step 1: Create `src/components/TaskCard.tsx`**

```tsx
import { useState, useRef, useEffect } from 'react';
import { Task, Group } from '../types';
import { useGroups } from '../hooks/useGroups';
import { useTasks } from '../hooks/useTasks';

interface TaskCardProps {
  task: Task;
  showGroup?: boolean;
  compact?: boolean;
}

export function TaskCard({ task, showGroup = false, compact = false }: TaskCardProps) {
  const { groups } = useGroups();
  const { toggleActive, archiveTask, updateTask, deleteTask } = useTasks();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [showActions, setShowActions] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  const group = task.groupId ? groups.find((g) => g.id === task.groupId) : null;

  const handleSave = () => {
    if (!title.trim()) return;
    updateTask(task.id, { title: title.trim(), deadline: deadline || null });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTitle(task.title);
      setDeadline(task.deadline || '');
      setEditing(false);
    }
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.isArchived;

  return (
    <div
      className={`task-card ${compact ? 'compact' : ''} ${task.isActive ? 'active-task' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {editing ? (
        <div className="task-edit">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="task-title-input"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            onKeyDown={handleKeyDown}
            className="task-deadline-input"
          />
          <button className="task-save-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <>
          <div className="task-main" onClick={() => setEditing(true)}>
            <span className={`task-title ${task.isActive ? 'active-title' : ''}`}>
              {task.title}
            </span>
            {task.deadline && (
              <span className={`task-deadline ${isOverdue ? 'overdue' : ''}`}>
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
            {showGroup && group && (
              <span className="task-group-badge">{group.name}</span>
            )}
          </div>
          {showActions && (
            <div className="task-actions">
              <button
                title={task.isActive ? 'Remove from active' : 'Add to active'}
                onClick={() => toggleActive(task)}
              >
                {task.isActive ? '◉' : '○'}
              </button>
              <button title="Mark done" onClick={() => archiveTask(task, 'done')}>✓</button>
              <button title="Skip" onClick={() => archiveTask(task, 'skipped')}>⏭</button>
              <button title="Edit" onClick={() => setEditing(true)}>✎</button>
              <button title="Delete" className="delete-btn" onClick={() => archiveTask(task, 'skipped')}>✕</button>
            </div>
          )}
        </>
      )}

      <style>{`
        .task-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .task-card:hover {
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent);
        }
        .task-card.active-task {
          border-left: 3px solid var(--accent);
        }
        .task-card.compact {
          padding: 8px 12px;
        }
        .task-main {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }
        .task-title {
          color: var(--text-primary);
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .task-title.active-title {
          color: var(--accent);
          font-weight: 500;
        }
        .task-deadline {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .task-deadline.overdue {
          color: var(--danger);
        }
        .task-group-badge {
          font-size: 0.7rem;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }
        .task-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
        .task-actions button {
          background: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          padding: 4px 6px;
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
        }
        .task-actions button:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .task-actions .delete-btn:hover {
          color: var(--danger);
        }
        .task-edit {
          display: flex;
          gap: 8px;
          flex: 1;
          align-items: center;
        }
        .task-title-input {
          flex: 1;
          min-width: 0;
        }
        .task-deadline-input {
          width: 140px;
        }
        .task-save-btn {
          background: var(--accent);
          color: white;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskCard.tsx
git commit -m "feat: add TaskCard component with inline editing and actions"
```

---

### TaskList Component

**Files:**
- Create: `src/components/TaskList.tsx`

Renders a list of task cards with a title header.

- [ ] **Step 1: Create `src/components/TaskList.tsx`**

```tsx
import { ReactNode } from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  title: string;
  tasks: Task[];
  showGroup?: boolean;
  compact?: boolean;
  empty?: ReactNode;
  actions?: ReactNode;
}

export function TaskList({ title, tasks, showGroup, compact, empty, actions }: TaskListProps) {
  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>{title}</h2>
        <span className="task-count">{tasks.length}</span>
        {actions}
      </div>
      {tasks.length === 0 ? (
        empty || null
      ) : (
        <div className="task-list-items">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} showGroup={showGroup} compact={compact} />
          ))}
        </div>
      )}
      <style>{`
        .task-list {
          margin-bottom: 24px;
        }
        .task-list-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .task-list-header h2 {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .task-count {
          font-size: 0.7rem;
          background: var(--bg-tertiary);
          color: var(--text-muted);
          padding: 1px 6px;
          border-radius: 10px;
        }
        .task-list-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskList.tsx
git commit -m "feat: add TaskList component"
```

---

### AddTaskForm Component

**Files:**
- Create: `src/components/AddTaskForm.tsx`

- [ ] **Step 1: Create `src/components/AddTaskForm.tsx`**

```tsx
import { useState } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useTasks } from '../hooks/useTasks';

interface AddTaskFormProps {
  defaultGroupId?: string | null;
  placeholder?: string;
  compact?: boolean;
}

export function AddTaskForm({ defaultGroupId = null, placeholder = 'Add a task...', compact = false }: AddTaskFormProps) {
  const { addTask } = useTasks();
  const { groups } = useGroups();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [groupId, setGroupId] = useState<string | null>(defaultGroupId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addTask(title.trim(), deadline || null, groupId);
      setTitle('');
      setDeadline('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`add-task-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="add-task-input"
        disabled={loading}
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="add-deadline-input"
      />
      {groups.length > 0 && (
        <select
          value={groupId || ''}
          onChange={(e) => setGroupId(e.target.value || null)}
          className="add-group-select"
        >
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      )}
      <button type="submit" className="add-task-btn" disabled={loading || !title.trim()}>
        Add
      </button>
      <style>{`
        .add-task-form {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .add-task-form.compact {
          margin-bottom: 0;
        }
        .add-task-input {
          flex: 1;
          min-width: 200px;
        }
        .add-deadline-input {
          width: 140px;
        }
        .add-group-select {
          width: 140px;
        }
        .add-task-btn {
          background: var(--accent);
          color: white;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-weight: 500;
          transition: background 0.2s;
        }
        .add-task-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .add-task-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AddTaskForm.tsx
git commit -m "feat: add AddTaskForm component"
```

---

### EmptyState Component

**Files:**
- Create: `src/components/EmptyState.tsx`

- [ ] **Step 1: Create `src/components/EmptyState.tsx`**

```tsx
interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon">✨</span>
      <p>{message}</p>
      <style>{`
        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: var(--text-muted);
        }
        .empty-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 8px;
        }
        .empty-state p {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EmptyState.tsx
git commit -m "feat: add EmptyState component"
```

---

## Home Page Implementation

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/BacklogPanel.tsx`

- [ ] **Step 1: Create `src/components/BacklogPanel.tsx`**

```tsx
import { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from './TaskList';
import { EmptyState } from './EmptyState';

interface BacklogPanelProps {
  groupId?: string | null;
  title?: string;
}

export function BacklogPanel({ groupId, title = 'Backlog' }: BacklogPanelProps) {
  const { tasks } = useTasks();

  const backlogTasks = useMemo(() => {
    let filtered = tasks.filter((t) => !t.isActive && !t.isArchived);
    if (groupId !== undefined) {
      filtered = filtered.filter((t) => t.groupId === groupId);
    }
    return filtered.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks, groupId]);

  return (
    <div className="backlog-panel">
      <TaskList
        title={title}
        tasks={backlogTasks}
        compact
        empty={<EmptyState message="Everything's done! Time to relax. 🎉" />}
      />
      <style>{`
        .backlog-panel {
          /* styled by parent */
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/pages/Home.tsx`**

```tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks, useGroups } from '../hooks';
import { AddTaskForm } from '../components/AddTaskForm';
import { TaskList } from '../components/TaskList';
import { TaskCard } from '../components/TaskCard';
import { BacklogPanel } from '../components/BacklogPanel';
import { EmptyState } from '../components/EmptyState';
import { GroupingMode } from '../types';

export function Home() {
  const { groupId } = useParams<{ groupId?: string }>();
  const { tasks } = useTasks();
  const { groups } = useGroups();
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('flat');

  const isGroupView = !!groupId;
  const currentGroup = isGroupView ? groups.find((g) => g.id === groupId) : null;

  const activeTasks = tasks.filter((t) => t.isActive && !t.isArchived && (!isGroupView || t.groupId === groupId));
  const backlogTasks = tasks.filter((t) => !t.isActive && !t.isArchived && (!isGroupView || t.groupId === groupId))
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  return (
    <div className={`page home-page ${isGroupView ? 'group-view' : ''}`}>
      <h1>{isGroupView ? currentGroup?.name || 'Group' : 'Home'}</h1>

      <div className="page-layout">
        <div className="main-area">
          <AddTaskForm
            defaultGroupId={isGroupView ? groupId : null}
            placeholder={isGroupView ? 'Add a task to this group...' : 'Add a task...'}
          />

          {isGroupView ? (
            <>
              <TaskList
                title="Active"
                tasks={activeTasks}
                empty={<EmptyState message="Pick something to focus on!" />}
              />
              <TaskList
                title="Backlog"
                tasks={backlogTasks}
                compact
                empty={<EmptyState message="Everything's done! Time to relax. 🎉" />}
              />
            </>
          ) : (
            <>
              {/* Active section with grouping */}
              <div className="grouping-toggle">
                {(['flat', 'subject', 'date', 'deadline'] as GroupingMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={groupingMode === mode ? 'active' : ''}
                    onClick={() => setGroupingMode(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              {activeTasks.length === 0 ? (
                <EmptyState message="Pick something to focus on!" />
              ) : (
                (() => {
                  if (groupingMode === 'flat') {
                    return <TaskList title="Active" tasks={activeTasks} showGroup />;
                  }
                  const grouped: Record<string, typeof activeTasks> = {};
                  activeTasks.forEach((t) => {
                    let key: string;
                    if (groupingMode === 'subject') {
                      key = t.groupId ? (groups.find((g) => g.id === t.groupId)?.name || 'Uncategorized') : 'Uncategorized';
                    } else if (groupingMode === 'date') {
                      if (!t.deadline) {
                        key = 'No date';
                      } else {
                        const d = new Date(t.deadline);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const weekEnd = new Date(today);
                        weekEnd.setDate(weekEnd.getDate() + 7);
                        if (d < today) key = 'Overdue';
                        else if (d < tomorrow) key = 'Today';
                        else if (d < weekEnd) key = 'This Week';
                        else key = 'Later';
                      }
                    } else if (groupingMode === 'deadline') {
                      if (!t.deadline) {
                        key = 'No deadline';
                      } else {
                        const d = new Date(t.deadline);
                        const today = new Date();
                        const diff = Math.ceil((d.getTime() - today.setHours(0, 0, 0, 0)) / 86400000);
                        if (diff < 0) key = `${Math.abs(diff)}d overdue`;
                        else if (diff === 0) key = 'Due today';
                        else if (diff === 1) key = 'Due tomorrow';
                        else if (diff <= 7) key = `Due in ${diff}d`;
                        else key = `Due in ${Math.ceil(diff / 7)}w`;
                      }
                    }
                    (grouped[key] = grouped[key] || []).push(t);
                  });
                  return Object.entries(grouped).map(([name, groupTasks]) =>
                    groupTasks.length > 0 ? (
                      <TaskList key={name} title={name} tasks={groupTasks} showGroup={groupingMode === 'flat'} />
                    ) : null
                  );
                })()
              )}
            </>
          )}
        </div>

        <div className="right-panel">
          <BacklogPanel groupId={isGroupView ? groupId : undefined} title={isGroupView ? 'Backlog' : 'All Backlog'} />
        </div>
      </div>

      <style>{`
        .home-page { }
        .page-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .main-area {
          flex: 1;
          min-width: 0;
        }
        .right-panel {
          width: var(--right-panel-width);
          flex-shrink: 0;
          position: sticky;
          top: 24px;
        }
        .grouping-toggle {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius);
          width: fit-content;
        }
        .grouping-toggle button {
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          transition: background 0.15s, color 0.15s;
        }
        .grouping-toggle button:hover {
          color: var(--text-primary);
        }
        .grouping-toggle button.active {
          background: var(--bg-tertiary);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx src/components/BacklogPanel.tsx
git commit -m "feat: implement Home page with active/backlog panels"
```

---

## Archived Page Implementation

**Files:**
- Modify: `src/pages/Archived.tsx`

- [ ] **Step 1: Implement `src/pages/Archived.tsx`**

```tsx
import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { ArchiveFilter, ArchivePeriod } from '../types';
import { TaskList } from '../components/TaskList';
import { TaskCard } from '../components/TaskCard';
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
        startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Monday
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Archived.tsx
git commit -m "feat: implement Archived page with grouping and filters"
```

---

## Settings Page — Group Management

**Files:**
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Implement `src/pages/Settings.tsx`**

```tsx
import { useState } from 'react';
import { useGroups, useTasks } from '../hooks';
import { Group } from '../types';

export function Settings() {
  const { groups, addGroup, renameGroup, deleteGroup, reorderGroups } = useGroups();
  const { moveToUncategorized } = useTasks();
  const [newGroupName, setNewGroupName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setLoading(true);
    try {
      await addGroup(newGroupName.trim());
      setNewGroupName('');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (g: Group) => {
    if (!editingName.trim() || editingName === g.name) {
      setEditingId(null);
      return;
    }
    await renameGroup(g.id, editingName.trim());
    setEditingId(null);
  };

  const handleDelete = async (g: Group) => {
    await moveToUncategorized(g.id);
    await deleteGroup(g.id);
    setDeletingId(null);
  };

  return (
    <div className="page settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>Groups</h2>
        <p className="section-desc">Manage your task groups (e.g., school subjects). Deleting a group moves its tasks to Uncategorized.</p>

        <form className="add-group-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name..."
            className="group-name-input"
          />
          <button type="submit" className="add-group-btn" disabled={loading || !newGroupName.trim()}>
            Add Group
          </button>
        </form>

        <div className="group-list">
          {groups.length === 0 ? (
            <p className="no-groups">No groups yet. Add one above!</p>
          ) : (
            groups.map((g) => (
              <div key={g.id} className="group-item">
                {editingId === g.id ? (
                  <form
                    className="rename-form"
                    onSubmit={(e) => { e.preventDefault(); handleRename(g); }}
                  >
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                      autoFocus
                      className="group-name-input"
                    />
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <span className="group-name">{g.name}</span>
                    <div className="group-actions">
                      <button className="edit-btn" onClick={() => { setEditingId(g.id); setEditingName(g.name); }}>
                        Rename
                      </button>
                      {deletingId === g.id ? (
                        <>
                          <span className="delete-confirm-text">Delete?</span>
                          <button className="confirm-delete-btn" onClick={() => handleDelete(g)}>Yes</button>
                          <button className="cancel-btn" onClick={() => setDeletingId(null)}>No</button>
                        </>
                      ) : (
                        <button className="delete-btn" onClick={() => setDeletingId(g.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <style>{`
        .settings-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
        }
        .settings-section h2 {
          font-size: 1.1rem;
          margin-bottom: 8px;
        }
        .section-desc {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .add-group-form {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .group-name-input {
          flex: 1;
        }
        .add-group-btn {
          background: var(--accent);
          color: white;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-weight: 500;
          white-space: nowrap;
        }
        .add-group-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .add-group-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .group-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .no-groups {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-align: center;
          padding: 16px;
        }
        .group-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
        }
        .group-name {
          font-size: 0.9rem;
        }
        .group-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .group-actions button {
          background: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          transition: color 0.15s;
        }
        .group-actions button:hover {
          color: var(--text-primary);
        }
        .group-actions .delete-btn:hover {
          color: var(--danger);
        }
        .delete-confirm-text {
          font-size: 0.8rem;
          color: var(--danger);
        }
        .confirm-delete-btn {
          color: var(--danger) !important;
          font-weight: 500;
        }
        .cancel-btn {
          color: var(--text-muted) !important;
        }
        .rename-form {
          display: flex;
          gap: 8px;
          flex: 1;
        }
        .save-btn {
          background: var(--accent);
          color: white;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat: implement Settings page with group CRUD"
```

---

## Stats Page Stub → Implementation

**Files:**
- Modify: `src/pages/Stats.tsx` (replace stub)

This is just a stub — full implementation is in Plan 3. For now, replace the stub with a placeholder:

- [ ] **Step 1: Replace `src/pages/Stats.tsx` stub with note**

```tsx
// Stats page — full implementation in Plan 3
export function Stats() {
  return (
    <div className="page">
      <h1>Stats</h1>
      <p style={{ color: 'var(--text-muted)' }}>Stats implementation coming in Plan 3.</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Stats.tsx
git commit -m "chore: add stats placeholder for Plan 3"
```

---

## Global Styles & Polish

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add layout and responsive styles to `src/styles/main.css`**

```css
/* Page layout */
.page {
  max-width: 1000px;
}

/* Right panel */
.right-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  min-height: 200px;
}

/* Task cards in compact mode */
.task-card.compact .task-main {
  cursor: pointer;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/main.css
git commit -m "style: add layout and panel styles"
```

---

## Build & Verify

- [ ] **Step 1: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: App loads, sidebar visible, sign in/sign up work, task CRUD functional, group management works

- [ ] **Step 3: Test the full flow:**
1. Sign up → sees Home with empty states
2. Add a group in Settings
3. Add tasks with title + deadline + group
4. Click task to inline-edit
5. Add task to active
6. Mark task done → goes to Archived
7. Mark task skipped → goes to Archived with skip status
8. Delete group → tasks move to Uncategorized

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete views and task management"
```

---

## After Plan 2

After completing this plan, the app will:
- Full Home dashboard with active grouping
- Group tabs with active/backlog split
- Archived with week/month grouping and filter
- Settings with group CRUD
- All task operations work
- Stats page placeholder ready for Plan 3

**Go to Plan 3: Stats & Polish** for charts, empty states, PWA setup, and Tauri integration.
