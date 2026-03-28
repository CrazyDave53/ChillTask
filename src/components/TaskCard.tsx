import { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { useGroups } from '../hooks/useGroups';
import { useTasks } from '../hooks/useTasks';

interface TaskCardProps {
  task: Task;
  showGroup?: boolean;
  compact?: boolean;
}

export function TaskCard({ task, showGroup = false, compact = false }: TaskCardProps) {
  const { groups } = useGroups();
  const { toggleActive, archiveTask, updateTask } = useTasks();
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
