import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import AuthLayout from '../components/AuthLayout/AuthLayout';
import FormField from '../components/FormField/FormField';
import Button from '../components/Button/Button';
import form from '../styles/authForm.module.css';

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const result = await register(email, password, username);
      if (result.success) {
        navigate('/login');
      } else if (/already exists/i.test(result.error || '')) {
        setErrors({ email: 'This email is already registered' });
      } else {
        setErrors({ form: result.error || 'Registration failed' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Sign up" title="Get started!" tone="red" scalloped={false} character="tomato">
      <form onSubmit={handleSignIn} data-testid="register-form" className={form.form}>
        <FormField
          type="email"
          label="Email address"
          data-testid="register-email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Enter email address"
          required
          disabled={submitting}
          error={errors.email}
          errorTestId="register-email-error"
        />
        <FormField
          type="text"
          label="Username"
          data-testid="register-username"
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          placeholder="Enter username"
          maxLength={40}
          disabled={submitting}
        />
        <FormField
          type="password"
          label="Password"
          data-testid="register-password"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Enter password"
          required
          disabled={submitting}
          error={errors.password}
          errorTestId="register-password-error"
        />
        <FormField
          type="password"
          label="Confirm password"
          data-testid="register-confirm"
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          placeholder="Enter password again"
          required
          disabled={submitting}
          error={errors.confirm}
          errorTestId="register-confirm-error"
        />
        {errors.form && (
          <p role="alert" data-testid="register-error" className={form.formError}>
            {errors.form}
          </p>
        )}
        <Button type="submit" fullWidth className={form.submit} data-testid="register-submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create new account'}
        </Button>
      </form>
      <p className={form.switch}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default SignInPage;
