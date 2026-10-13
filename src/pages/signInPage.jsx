import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register(email, password);
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error || 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <h1>Sign In</h1>
      {error && (
        <p role="alert" data-testid="register-error" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSignIn} data-testid="register-form">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          data-testid="register-email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          required
          disabled={submitting}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          data-testid="register-password"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          required
          disabled={submitting}
        />
        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          type="password"
          id="confirmPassword"
          data-testid="register-confirm"
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          placeholder="Confirm Password"
          required
          disabled={submitting}
        />
        <button type="submit" data-testid="register-submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <div>
        <button type="button" onClick={() => navigate('/login')}>
          Do you have an account? Login
        </button>
      </div>
    </main>
  );
}

export default SignInPage;
