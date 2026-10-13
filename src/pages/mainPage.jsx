import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import CategoryDropdown from '../components/categoryDropdown';
import Carousel from '../components/carousel';
import { useRecipe } from '../contexts/recipeContext';
import { RecipeCardGrid } from '../components/recipeCard';

function MainPage() {
  const { recipes, getAllRecipes, isLoading, error } = useRecipe();

  useEffect(() => {
    getAllRecipes({ limit: 12 });
  }, []);

  return (
    <div>
      <Header />
      <CategoryDropdown />
      <Carousel />
      <main id="main-content" tabIndex={-1} style={{ maxWidth: 960, margin: '1.5rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Recent recipes</h2>
          <Link to="/search">Search all</Link>
        </div>
        {isLoading && <p>Loading…</p>}
        {error && (
          <p role="alert" style={{ color: 'crimson' }}>
            {error}
          </p>
        )}
        {!isLoading && recipes.length === 0 && !error && (
          <p>No recipes yet. Be the first to <Link to="/postPage">share one</Link>.</p>
        )}
        <RecipeCardGrid recipes={recipes} />
      </main>
    </div>
  );
}

export default MainPage;
