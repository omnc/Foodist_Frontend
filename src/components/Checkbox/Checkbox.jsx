import React from 'react';
import styles from './Checkbox.module.css';

/** Native checkbox restyled to the design (square outline, green fill with a tick when checked). */
export default function Checkbox({ label, className = '', ...inputProps }) {
  return (
    <label className={`${styles.checkbox} ${className}`}>
      <input type="checkbox" className={styles.input} {...inputProps} />
      <span>{label}</span>
    </label>
  );
}
