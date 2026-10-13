import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { apiFetch, authHeaders, describeApiError } from '../lib/apiClient';
import Header from '../components/header';
import { RecipeCardGrid } from '../components/recipeCard';
import '../design/myPage.css';

function MyPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiFetch('/recipes/mine', {
                    headers: authHeaders({ token: user?.token }),
                });
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
    }, [authLoading, isAuthenticated, user?.token]);

    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <Header />
            <main id="main-content" tabIndex={-1} className="myRecipes">
                <h1>My Recipes</h1>
                {authLoading || loading ? (
                    <p>Loading recipes...</p>
                ) : error ? (
                    <p role="alert" style={{ color: 'crimson' }}>{error}</p>
                ) : recipes.length === 0 ? (
                    <p>
                        You haven't created any recipes yet. <Link to="/postPage">Add a recipe</Link>.
                    </p>
                ) : (
                    <RecipeCardGrid recipes={recipes} />
                )}
            </main>
        </div>
    );
}

export default MyPage;
