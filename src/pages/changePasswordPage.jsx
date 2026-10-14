import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import AuthLayout from '../components/AuthLayout/AuthLayout';
import FormField from '../components/FormField/FormField';
import PasswordRules, { passwordMeetsRules } from '../components/PasswordRules/PasswordRules';
import Button from '../components/Button/Button';
import form from '../styles/authForm.module.css';

/** Logged-in password change. The API also needs the current password, so the design's two fields become three. */
function ChangePasswordPage() {
  const { changePassword, isAuthenticated, isLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setDone(false);
    if (!passwordMeetsRules(newPassword)) {
      setErrors({ next: 'Your new password does not meet all the requirements' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setDone(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else if (result.statuscode === 401) {
        setErrors({ current: 'Current password is incorrect' });
      } else {
        setErrors({ form: result.error || 'Unable to change password' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Change password" title="Don’t forget this one!" tone="green">
      <form onSubmit={handleSubmit} data-testid="change-password-form" className={form.form}>
        <FormField
          type="password"
          label="Current password"
          data-testid="change-current"
          autoComplete="current-password"
          onChange={(e) => setCurrentPassword(e.target.value)}
          value={currentPassword}
          placeholder="Enter current password"
          required
          disabled={submitting}
          error={errors.current}
          errorTestId="change-current-error"
        />
        <FormField
          type="password"
          label="New password"
          data-testid="change-new"
          autoComplete="new-password"
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          placeholder="Enter new password"
          required
          disabled={submitting}
          error={errors.next}
          errorTestId="change-new-error"
        />
        <FormField
          type="password"
          label="Confirm new password"
          data-testid="change-confirm"
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          placeholder="Enter new password again"
          required
          disabled={submitting}
          error={errors.confirm}
          errorTestId="change-confirm-error"
          hint={<PasswordRules value={newPassword} />}
        />
        {errors.form && (
          <p role="alert" className={form.formError} data-testid="change-error">
            {errors.form}
          </p>
        )}
        {done && (
          <p role="status" className={form.success} data-testid="change-success">
            Password updated. <Link to="/myPage">Back to your profile</Link>
          </p>
        )}
        <Button type="submit" fullWidth className={form.submit} data-testid="change-submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ChangePasswordPage;
