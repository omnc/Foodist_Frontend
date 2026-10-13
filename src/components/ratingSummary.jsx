import React from 'react';
import '../design/recipeCard.css';

/** Star + average comment rating, or an explicit "No ratings yet" (never a default number). */
export default function RatingSummary({ averageRating, ratingCount, className = '' }) {
  const hasRating = averageRating !== null && averageRating !== undefined && !Number.isNaN(Number(averageRating));
  if (!hasRating) {
    return (
      <span className={`rating-summary rating-summary-empty ${className}`} data-testid="rating-summary">
        No ratings yet
      </span>
    );
  }
  const value = Number(averageRating);
  return (
    <span
      className={`rating-summary ${className}`}
      data-testid="rating-summary"
      aria-label={`Rated ${value.toFixed(1)} out of 5${ratingCount ? ` from ${ratingCount} ratings` : ''}`}
    >
      <span className="rating-summary-star" aria-hidden="true">★</span>
      <span className="rating-summary-value">{value.toFixed(1)}</span>
      {ratingCount ? <span className="rating-summary-count">({ratingCount})</span> : null}
    </span>
  );
}
