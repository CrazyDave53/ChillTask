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
