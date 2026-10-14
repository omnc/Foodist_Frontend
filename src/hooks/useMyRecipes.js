import { useEffect, useState } from 'react';
import { apiFetch, authHeaders, describeApiError } from '../lib/apiClient';

/** Loads the signed-in user's own recipes (`GET /recipes/mine`). Pass `enabled=false` until auth is ready. */
export default function useMyRecipes({ token, enabled }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiFetch('/recipes/mine', { headers: authHeaders({ token }) });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) {
          setError(describeApiError(response, data, 'Failed to load your recipes'));
          return;
        }
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load your recipes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, token]);

  return { recipes, loading, error };
}
