import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout/PageLayout';
import RecipeCard, { RecipeCardGrid } from '../components/RecipeCard/RecipeCard';
import { SearchIcon, CloseIcon } from '../components/Icon/Icon';
import SortSelect from '../components/SortSelect/SortSelect';
import { useRecipe } from '../contexts/recipeContext';
import { sortRecipes } from '../lib/sortRecipes';
import styles from './recipeListing.module.css';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Breakfasts', value: 'BREAKFAST' },
  { label: 'Lunch', value: 'LUNCH' },
  { label: 'Dinner', value: 'DINNER' },
  { label: 'Appetizers', value: 'APPETIZER' },
  { label: 'Desserts', value: 'DESSERT' },
  { label: 'Drinks', value: 'DRINK' },
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { recipes, getAllRecipes, isLoading, error } = useRecipe();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('newest');
  const mealtype = searchParams.get('mealtype') || '';
  const isMealPage = Boolean(mealtype) && !searchParams.get('q');
  const sortedRecipes = useMemo(() => sortRecipes(recipes, sort), [recipes, sort]);

  useEffect(() => {
    setQ(searchParams.get('q') || '');
    getAllRecipes({
      q: searchParams.get('q') || undefined,
      mealtype: searchParams.get('mealtype') || undefined,
      limit: 50,
    });
  }, [searchParams]);

  const setFilters = ({ nextQ = q, nextMeal = mealtype } = {}) => {
    const next = {};
    if (nextQ.trim()) next.q = nextQ.trim();
    if (nextMeal) next.mealtype = nextMeal;
    setSearchParams(next);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setFilters();
  };

  const highlightedDrink = sortedRecipes.find((recipe) => recipe.mealtype === 'DRINK');
  const highlightedDishes = sortedRecipes
    .filter((recipe) => recipe.id !== highlightedDrink?.id && recipe.mealtype === 'LUNCH')
    .slice(0, 2);
  const featured = isMealPage
    ? [highlightedDrink, ...highlightedDishes].filter(Boolean)
    : [];
  const listingRecipes = sortedRecipes.slice(0, 6);

  return (
    <PageLayout mainClassName={`${styles.main} ${isMealPage ? styles.mealMain : ''}`}>
      <div className={styles.container}>
        <div className={`${styles.topRow} ${isMealPage ? styles.mealTop : ''}`}>
          <h1>{isMealPage ? 'Meals' : <><span aria-hidden="true">Search result</span><span className="visually-hidden">Find recipes</span></>}</h1>
          {!isMealPage && (
            <>
              <form onSubmit={onSubmit} className={styles.searchForm} role="search">
                <label htmlFor="listing-search" className="visually-hidden">Search recipes</label>
                <input
                  id="listing-search"
                  data-testid="listing-search"
                  type="search"
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Lorem ipsum"
                />
                {q && (
                  <button type="button" className={styles.clear} onClick={() => { setQ(''); setFilters({ nextQ: '' }); }} aria-label="Clear search">
                    <CloseIcon size={22} />
                  </button>
                )}
                <button type="submit" className={styles.searchButton} aria-label="Search"><SearchIcon size={22} /></button>
              </form>
              <label className={styles.sort}>
                <span>Sort by</span>
                <select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="rating">Rating</option>
                  <option value="title">Title</option>
                </select>
              </label>
            </>
          )}
        </div>

        {isMealPage && (
          <p className={styles.intro}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eu dui quis libero laoreet lacinia.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        )}

        {isLoading && <p>Loading recipes…</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {!isLoading && !error && recipes.length === 0 && <p>No recipes matched. Try another search or category.</p>}

        {featured.length > 0 && (
          <section className={styles.featureGrid} aria-label="Featured meal recipes">
            <div className={styles.featureLarge}><RecipeCard recipe={featured[0]} size="large" /></div>
            <div className={styles.featureSide}>
              {featured.slice(1, 3).map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </section>
        )}

        {isMealPage && (
          <nav className={styles.tabs} aria-label="Meal types">
            {TABS.map((tab) => (
              <button
                key={tab.value || 'all'}
                type="button"
                className={mealtype === tab.value ? styles.activeTab : ''}
                onClick={() => setFilters({ nextQ: '', nextMeal: tab.value })}
              >
                {tab.label}
              </button>
            ))}
            <button type="button" onClick={() => setFilters({ nextQ: '', nextMeal: '' })}>More</button>
          </nav>
        )}

        <div className={styles.resultMeta}>
          <p>Total {recipes.length} recipes</p>
          {isMealPage && (
            <SortSelect value={sort} onChange={setSort} />
          )}
        </div>

        <div className={styles.results} data-testid="listing-results">
          <RecipeCardGrid recipes={listingRecipes} />
        </div>
      </div>
    </PageLayout>
  );
}

export default SearchPage;
