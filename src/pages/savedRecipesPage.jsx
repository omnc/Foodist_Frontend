import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { useAuth } from '../contexts/authContext';
import { apiFetch, authHeaders } from '../lib/apiClient';

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
          setError(data.error || 'Failed to load saved recipes');
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
      <div>
        <Header />
        <p className="page-content">Loading saved recipes…</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main id="main-content" tabIndex={-1} className="page-content">
        <h1>Saved recipes</h1>
        {error && (
          <p role="alert" style={{ color: 'crimson' }}>
            {error}
          </p>
        )}
        {!error && items.length === 0 && <p>You have not saved any recipes yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
          {items.map((entry) => (
            <li key={entry.id}>
              <Link to={`/recipe/${entry.recipeID || entry.recipe?.id}`}>
                {entry.recipe?.title || `Recipe #${entry.recipeID}`}
              </Link>
              {entry.note ? <div style={{ opacity: 0.75 }}>{entry.note}</div> : null}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default SavedRecipesPage;
