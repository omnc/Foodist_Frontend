import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { useRecipe } from '../../contexts/recipeContext';
import { MEAL_TYPES } from '../../config/api';
import RatingSummary from '../RatingSummary/RatingSummary';
import { HeartIcon } from '../Icon/Icon';
import styles from './RecipeCard.module.css';

export const mealTypeLabel = (value) => MEAL_TYPES.find((mt) => mt.value === value)?.label || value || '';

/**
 * Recipe card: image with save heart, meal type, title and rating.
 * `size="large"` is the featured variant used by the category page highlight.
 */
export default function RecipeCard({ recipe, onUnsaved, size = 'regular' }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { savedIds, saveRecipe, unsaveRecipe } = useRecipe();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isSaved = savedIds.has(Number(recipe.id));
  const image = recipe.titleImageUrl || recipe.titleImage;

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    const result = isSaved ? await unsaveRecipe(recipe.id) : await saveRecipe(recipe.id);
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (isSaved && onUnsaved) onUnsaved(recipe.id);
  };

  return (
    <article className={`${styles.card} ${size === 'large' ? styles.large : ''}`} data-testid={`recipe-card-${recipe.id}`}>
      <Link to={`/recipe/${recipe.id}`} className={styles.link}>
        <div className={styles.media}>
          {image ? <img src={image} alt={recipe.title} className={styles.image} /> : <div className={styles.placeholder}>No image</div>}
          <button
            type="button"
            className={styles.heart}
            onClick={toggleSave}
            disabled={busy}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${recipe.title} from saved recipes` : `Save ${recipe.title}`}
            data-testid={`recipe-card-heart-${recipe.id}`}
          >
            <HeartIcon filled={isSaved} size={44} />
          </button>
        </div>
        <div className={styles.body}>
          <span className={styles.mealType}>{mealTypeLabel(recipe.mealtype)}</span>
          <h3 className={styles.title}>{recipe.title}</h3>
          <RatingSummary averageRating={recipe.averageRating} ratingCount={recipe.ratingCount} />
        </div>
      </Link>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </article>
  );
}

export function RecipeCardGrid({ recipes, onUnsaved }) {
  return (
    <ul className={styles.grid}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} onUnsaved={onUnsaved} />
        </li>
      ))}
    </ul>
  );
}
