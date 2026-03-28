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
