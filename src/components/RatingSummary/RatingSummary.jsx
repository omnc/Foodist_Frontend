import React from 'react';
import { StarIcon } from '../Icon/Icon';
import styles from './RatingSummary.module.css';

/** Star + average comment rating, or an explicit "No ratings yet" (never a default number). */
export default function RatingSummary({ averageRating, ratingCount, className = '' }) {
  const hasRating = averageRating !== null && averageRating !== undefined && !Number.isNaN(Number(averageRating));
  if (!hasRating) {
    return (
      <span className={`${styles.rating} ${styles.empty} ${className}`} data-testid="rating-summary">
        No ratings yet
      </span>
    );
  }
  const value = Number(averageRating);
  return (
    <span
      className={`${styles.rating} ${className}`}
      data-testid="rating-summary"
      aria-label={`Rated ${value.toFixed(1)} out of 5${ratingCount ? ` from ${ratingCount} ratings` : ''}`}
    >
      <StarIcon size={23} />
      <span className={styles.value}>{value.toFixed(1)}</span>
    </span>
  );
}
