import React from 'react';
import { ChevronIcon } from '../Icon/Icon';
import { SORT_OPTIONS } from '../../lib/sortRecipes';
import styles from './SortSelect.module.css';

/** Compact "Sort by" pill: a native select (keeps keyboard and screen-reader behaviour) with a custom chevron. */
export default function SortSelect({ value, onChange, className = '' }) {
  return (
    <label className={`${styles.sort} ${className}`}>
      <span className="visually-hidden">Sort recipes</span>
      <select aria-label="Sort recipes" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="newest">Sort by</option>
        {SORT_OPTIONS.filter((option) => option.value !== 'newest').map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronIcon size={16} className={styles.chevron} />
    </label>
  );
}
