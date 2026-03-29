import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password);
      navigate('/');
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      console.error('Google sign up error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign up failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
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
            minLength={6}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <button className="auth-google" onClick={handleGoogle} disabled={loading}>
          Sign up with Google
        </button>
        <p className="auth-switch">
          Already have an account? <a href="/ChillTask/signin">Sign in</a>
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
