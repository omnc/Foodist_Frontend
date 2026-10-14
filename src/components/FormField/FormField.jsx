import React, { useId } from 'react';
import styles from './FormField.module.css';

/**
 * Labelled text input with the design's four states: default, focus, filled and error.
 * Pass `error` to show the message and flag the input; `inputProps` go straight to the <input>.
 */
export default function FormField({ label, error, invalid = false, errorTestId, hint, className = '', ...inputProps }) {
  const generatedId = useId();
  const id = inputProps.id || generatedId;
  const errorId = `${id}-error`;
  const hasError = Boolean(error) || invalid;

  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        className={styles.input}
        aria-invalid={hasError || undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className={styles.error} role="alert" data-testid={errorTestId}>
          {error}
        </p>
      )}
      {!error && hint}
    </div>
  );
}
