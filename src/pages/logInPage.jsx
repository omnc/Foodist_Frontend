import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import AuthLayout from '../components/AuthLayout/AuthLayout';
import FormField from '../components/FormField/FormField';
import Checkbox from '../components/Checkbox/Checkbox';
import Button from '../components/Button/Button';
import form from '../styles/authForm.module.css';

const REMEMBERED_EMAIL_KEY = 'foodist_remembered_email';

function LogInPage() {
  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(rememberedEmail));
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
        if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        navigate('/');
      } else {
        setError(result.error || 'An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Log in" title="Welcome back!" tone="green" character="leek">
      <form onSubmit={handleLogin} data-testid="login-form" className={form.form}>
        <FormField
          type="email"
          label="Email address"
          data-testid="login-email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Enter email address"
          required
          disabled={submitting}
          invalid={Boolean(error)}
        />
        <FormField
          type="password"
          label="Password"
          data-testid="login-password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Enter password"
          required
          disabled={submitting}
          error={error}
          errorTestId="login-error"
        />
        <div className={form.metaRow}>
          <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/forgotPassword" className={form.smallLink}>
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth className={form.submit} data-testid="login-submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className={form.switch}>
        Don't have an account? <Link to="/signin">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export default LogInPage;
