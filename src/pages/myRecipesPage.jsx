import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { sortRecipes } from '../lib/sortRecipes';
import useMyRecipes from '../hooks/useMyRecipes';
import PageLayout from '../components/PageLayout/PageLayout';
import SortSelect from '../components/SortSelect/SortSelect';
import { RecipeCardGrid } from '../components/RecipeCard/RecipeCard';
import { ArrowRightIcon } from '../components/Icon/Icon';
import styles from './myRecipesPage.module.css';

function MyRecipesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { recipes, loading, error } = useMyRecipes({ token: user?.token, enabled: !authLoading && isAuthenticated });
    const [sort, setSort] = useState('newest');
    const sorted = useMemo(() => sortRecipes(recipes, sort), [recipes, sort]);

    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <PageLayout mainClassName={styles.main}>
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <button type="button" className={styles.back} onClick={() => navigate('/myPage')}>
                        <ArrowRightIcon size={28} className={styles.backArrow} />
                        Go back
                    </button>
                    <h1 className="visually-hidden">My recipes ({recipes.length})</h1>
                    <SortSelect value={sort} onChange={setSort} />
                </div>

                {authLoading || loading ? (
                    <p>Loading recipes...</p>
                ) : error ? (
                    <p role="alert" className={styles.error}>{error}</p>
                ) : recipes.length === 0 ? (
                    <p>
                        You haven't created any recipes yet. <Link to="/postPage">Add a recipe</Link>.
                    </p>
                ) : (
                    <div className={styles.results}>
                        <RecipeCardGrid recipes={sorted} />
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

export default MyRecipesPage;
