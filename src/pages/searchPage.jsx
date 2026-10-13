import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/header';
import { useRecipe } from '../contexts/recipeContext';
import { MEAL_TYPES } from '../config/api';
import { RecipeCardGrid } from '../components/recipeCard';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { recipes, getAllRecipes, isLoading, error } = useRecipe();
  const [q, setQ] = useState(searchParams.get('q') || '');

  const mealtype = searchParams.get('mealtype') || '';

  useEffect(() => {
    getAllRecipes({
      q: searchParams.get('q') || undefined,
      mealtype: searchParams.get('mealtype') || undefined,
      limit: 50,
    });
  }, [searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (q.trim()) next.q = q.trim();
    if (mealtype) next.mealtype = mealtype;
    setSearchParams(next);
  };

  return (
    <div>
      <Header />
      <main id="main-content" tabIndex={-1} className="page-content">
        <h1>Find recipes</h1>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or description"
            aria-label="Search recipes"
            style={{ flex: '1 1 220px', padding: '0.5rem' }}
          />
          <select
            aria-label="Meal type"
            value={mealtype}
            onChange={(e) => {
              const next = {};
              if (q.trim()) next.q = q.trim();
              if (e.target.value) next.mealtype = e.target.value;
              setSearchParams(next);
            }}
            style={{ padding: '0.5rem' }}
          >
            <option value="">All meal types</option>
            {MEAL_TYPES.map((mt) => (
              <option key={mt.value} value={mt.value}>
                {mt.label}
              </option>
            ))}
          </select>
          <button type="submit">Search</button>
        </form>

        {isLoading && <p>Loading recipes…</p>}
        {error && (
          <p role="alert" style={{ color: 'crimson' }}>
            {error}
          </p>
        )}
        {!isLoading && !error && recipes.length === 0 && (
          <p>No recipes matched. Try another search or category.</p>
        )}

        <RecipeCardGrid recipes={recipes} />

        <button type="button" onClick={() => navigate('/')}>
          Back to home
        </button>
      </main>
    </div>
  );
}

export default SearchPage;
