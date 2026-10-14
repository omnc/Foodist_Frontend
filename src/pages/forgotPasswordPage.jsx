import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout/AuthLayout';
import FormField from '../components/FormField/FormField';
import Button from '../components/Button/Button';
import form from '../styles/authForm.module.css';

/**
 * UI-only: the API has no unauthenticated reset flow yet (see the note in the backend's change-password route),
 * so submitting says so instead of pretending an email was sent.
 */
function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthLayout eyebrow="Oops" title="Forgot password?" tone="green">
      <form onSubmit={handleSubmit} data-testid="forgot-form" className={form.form}>
        <FormField
          type="email"
          label="Email address"
          data-testid="forgot-email"
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setSubmitted(false);
          }}
          value={email}
          placeholder="Enter email address to reset your password"
          required
        />
        {submitted && (
          <p role="status" className={form.notice} data-testid="forgot-notice">
            Password reset by email is not available yet. If you can still log in, you can{' '}
            <Link to="/changePassword">change your password</Link> instead.
          </p>
        )}
        <Button type="submit" fullWidth className={form.submit} data-testid="forgot-submit">
          Reset password
        </Button>
      </form>
      <p className={form.switch}>
        Don't have an account? <Link to="/signin">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
