import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout/PageLayout';
import { useAuth } from '../contexts/authContext';
import { apiFetch, authHeaders, describeApiError } from '../lib/apiClient';
import { RecipeCardGrid } from '../components/RecipeCard/RecipeCard';
import styles from './savedRecipesPage.module.css';

function SavedRecipesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiFetch('/saved-recipes', {
          headers: authHeaders({ token: user?.token }),
        });
        const data = await response.json().catch(() => ([]));
        if (!response.ok) {
          setError(describeApiError(response, data, 'Failed to load saved recipes'));
          return;
        }
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load saved recipes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, isAuthenticated, user, navigate]);

  if (authLoading || loading) {
    return (
      <PageLayout mainClassName={styles.main}>
        <div className={styles.container}><p>Loading saved recipes…</p></div>
      </PageLayout>
    );
  }

  return (
    <PageLayout mainClassName={styles.main}>
      <div className={styles.container}>
        <h1>Saved recipes</h1>
        {error && (
          <p role="alert" style={{ color: 'crimson' }}>
            {error}
          </p>
        )}
        {!error && items.length === 0 && <p>You have not saved any recipes yet.</p>}
        <RecipeCardGrid
          recipes={items.filter((entry) => entry.recipe).map((entry) => entry.recipe)}
          onUnsaved={(recipeId) => setItems((prev) => prev.filter((entry) => Number(entry.recipe?.id) !== Number(recipeId)))}
        />
      </div>
    </PageLayout>
  );
}

export default SavedRecipesPage;
