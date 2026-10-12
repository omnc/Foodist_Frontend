import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import CategoryDropdown from '../components/categoryDropdown';
import Carousel from '../components/carousel';
import { useRecipe } from '../contexts/recipeContext';

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
      <section style={{ maxWidth: 960, margin: '1.5rem auto', padding: '0 1rem' }}>
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
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipe/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {(recipe.titleImageUrl || recipe.titleImage) ? (
                  <img
                    src={recipe.titleImageUrl || recipe.titleImage}
                    alt={recipe.title}
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <div style={{ height: 140, background: '#eee', display: 'grid', placeItems: 'center', borderRadius: 4 }}>
                    No image
                  </div>
                )}
                <strong>{recipe.title}</strong>
                <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{recipe.mealtype}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default MainPage;
