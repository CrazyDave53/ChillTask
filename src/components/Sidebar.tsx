import { NavLink, useParams } from 'react-router-dom';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { groups } = useGroups();
  const { signOut } = useAuth();
  const { groupId } = useParams();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">✓</span>
        <span className="sidebar-title">ChillTask</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive && !groupId ? 'active' : ''}`}>
          <span className="nav-icon">🏠</span>
          Home
        </NavLink>

        <div className="nav-divider" />

        {groups.map((g) => (
          <NavLink
            key={g.id}
            to={`/group/${g.id}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📚</span>
            {g.name}
          </NavLink>
        ))}

        <div className="nav-divider" />

        <NavLink to="/archived" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span>
          Archived
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          Stats
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item sign-out" onClick={signOut}>
          <span className="nav-icon">🚪</span>
          Sign Out
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          min-height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-logo {
          font-size: 1.25rem;
        }
        .sidebar-title {
          font-weight: 600;
          font-size: 1.125rem;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: var(--bg-tertiary);
          color: var(--accent);
        }
        .nav-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }
        .nav-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 12px;
        }
        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid var(--border);
        }
        .sign-out:hover {
          color: var(--danger);
        }
        .app-layout {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
      `}</style>
    </aside>
  );
}
