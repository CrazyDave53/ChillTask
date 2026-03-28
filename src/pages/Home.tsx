import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks, useGroups } from '../hooks';
import { AddTaskForm } from '../components/AddTaskForm';
import { TaskList } from '../components/TaskList';
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
                    } else {
                      // deadline grouping
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
                      <TaskList key={name} title={name} tasks={groupTasks} />
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
