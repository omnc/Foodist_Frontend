import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

function LogInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Log In</h1>
      {error && (
        <p role="alert" data-testid="login-error" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      <form onSubmit={handleLogin} data-testid="login-form">
        <input
          type="email"
          id="email"
          data-testid="login-email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          required
          disabled={submitting}
        />
        <input
          type="password"
          id="password"
          data-testid="login-password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          required
          disabled={submitting}
        />
        <button type="submit" data-testid="login-submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <div>
        <button type="button" onClick={() => navigate('/signin')}>
          Don't have an account? Sign In
        </button>
      </div>
    </div>
  );
}

export default LogInPage;
