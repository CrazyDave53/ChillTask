import { useState } from 'react';
import { useGroups, useTasks } from '../hooks';
import { Group } from '../types';

export function Settings() {
  const { groups, addGroup, renameGroup, deleteGroup } = useGroups();
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
