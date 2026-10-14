import React from 'react';
import { MinusIcon, PlusIcon } from '../Icon/Icon';
import styles from './NumberStepper.module.css';

/** Number input flanked by minus / plus buttons (serving size). */
export default function NumberStepper({ value, onChange, min = 1, max = 99, label, testId, ...inputProps }) {
  const numeric = Number(value) || min;
  const step = (delta) => onChange(Math.min(max, Math.max(min, numeric + delta)));

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.button}
        aria-label={`Decrease ${label}`}
        disabled={numeric <= min}
        onClick={() => step(-1)}
      >
        <MinusIcon size={20} />
      </button>
      <input
        type="number"
        className={styles.input}
        value={value}
        min={min}
        max={max}
        aria-label={label}
        data-testid={testId}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
      <button
        type="button"
        className={styles.button}
        aria-label={`Increase ${label}`}
        disabled={numeric >= max}
        onClick={() => step(1)}
      >
        <PlusIcon size={20} />
      </button>
    </div>
  );
}
