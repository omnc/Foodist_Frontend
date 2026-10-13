import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useRecipe } from '../contexts/recipeContext';
import { MEAL_TYPES } from '../config/api';
import RatingSummary from './ratingSummary';
import '../design/recipeCard.css';

const mealTypeLabel = (value) => MEAL_TYPES.find((mt) => mt.value === value)?.label || value || '';

/** Card layout: image with heart overlay, meal type, title, star + average rating. */
export default function RecipeCard({ recipe, onUnsaved }) {
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
    <article className="recipe-card" data-testid={`recipe-card-${recipe.id}`}>
      <Link to={`/recipe/${recipe.id}`} className="recipe-card-link">
        <div className="recipe-card-image">
          {image ? <img src={image} alt={recipe.title} /> : <div className="recipe-card-placeholder">No image</div>}
          <button
            type="button"
            className={`recipe-card-heart ${isSaved ? 'saved' : ''}`}
            onClick={toggleSave}
            disabled={busy}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${recipe.title} from saved recipes` : `Save ${recipe.title}`}
            data-testid={`recipe-card-heart-${recipe.id}`}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>
        <div className="recipe-card-body">
          <span className="recipe-card-mealtype">{mealTypeLabel(recipe.mealtype)}</span>
          <h3 className="recipe-card-title">{recipe.title}</h3>
          <RatingSummary averageRating={recipe.averageRating} ratingCount={recipe.ratingCount} />
        </div>
      </Link>
      {error && (
        <p role="alert" className="recipe-card-error">
          {error}
        </p>
      )}
    </article>
  );
}

export function RecipeCardGrid({ recipes, onUnsaved }) {
  return (
    <ul className="recipe-card-grid">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} onUnsaved={onUnsaved} />
        </li>
      ))}
    </ul>
  );
}
