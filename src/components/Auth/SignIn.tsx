import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function SignIn() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button className="auth-google" onClick={signInWithGoogle} disabled={loading}>
          Sign in with Google
        </button>
        <p className="auth-switch">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
        }
        .auth-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          width: 100%;
          max-width: 360px;
        }
        .auth-card h1 {
          font-size: 1.5rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .auth-card form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auth-card input {
          width: 100%;
        }
        .auth-card button {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: white;
          border-radius: var(--radius-sm);
          font-weight: 500;
          transition: background 0.2s;
        }
        .auth-card button:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .auth-card button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-google {
          margin-top: 12px;
          background: var(--bg-tertiary) !important;
          border: 1px solid var(--border) !important;
        }
        .auth-error {
          color: var(--danger);
          font-size: 0.875rem;
        }
        .auth-switch {
          margin-top: 16px;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .auth-switch a {
          color: var(--accent);
          text-decoration: none;
        }
        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
