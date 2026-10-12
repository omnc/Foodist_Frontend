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
    <div>
      <h1>Sign In</h1>
      {error && (
        <p role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          id="email"
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
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          required
          disabled={submitting}
        />
        <input
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          placeholder="Confirm Password"
          required
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <div>
        <button type="button" onClick={() => navigate('/login')}>
          Do you have an account? Login
        </button>
      </div>
    </div>
  );
}

export default SignInPage;
