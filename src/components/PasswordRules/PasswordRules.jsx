import React from 'react';
import { CheckIcon } from '../Icon/Icon';
import styles from './PasswordRules.module.css';

export const PASSWORD_RULES = [
  { id: 'length', label: 'Minimum 8 characters', test: (value) => value.length >= 8 },
  { id: 'lower', label: 'At least one lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'upper', label: 'At least one uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'At least one number', test: (value) => /\d/.test(value) },
];

export function passwordMeetsRules(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

/** Live checklist: each rule turns green as the typed password satisfies it. */
export default function PasswordRules({ value }) {
  return (
    <ul className={styles.rules} aria-label="Password requirements" data-testid="password-rules">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li key={rule.id} className={met ? styles.met : styles.unmet} data-met={met}>
            <CheckIcon size={16} />
            <span>{rule.label}</span>
            <span className="visually-hidden">{met ? ' (met)' : ' (not met yet)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
