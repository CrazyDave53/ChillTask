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
