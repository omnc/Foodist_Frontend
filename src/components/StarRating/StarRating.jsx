import React from 'react';
import { StarIcon } from '../Icon/Icon';
import styles from './StarRating.module.css';

/** Read-only row of five stars; the value is rounded to the nearest whole star. */
export default function StarRating({ value = 0, size = 20, className = '' }) {
  const filledCount = Math.round(Number(value) || 0);
  return (
    <span className={`${styles.stars} ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} size={size} filled={star <= filledCount} />
      ))}
    </span>
  );
}
