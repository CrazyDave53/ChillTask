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
