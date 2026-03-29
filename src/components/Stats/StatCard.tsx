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
        {value !== undefined && (
          <span className="stat-value">
            {value}{unit && <span className="stat-unit"> {unit}</span>}
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
        }
        .stat-body {
          /* chart goes here */
        }
      `}</style>
    </div>
  );
}
