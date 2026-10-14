import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Carousel from '../components/carousel';
import Button from '../components/Button/Button';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import { ArrowRightIcon } from '../components/Icon/Icon';
import { useRecipe } from '../contexts/recipeContext';
import breakfast from '../assets/home/category-breakfast.webp';
import lunch from '../assets/home/category-lunch.webp';
import dinner from '../assets/home/category-dinner.webp';
import onion from '../assets/home/char-onion.png';
import leek from '../assets/home/char-leek.png';
import tomato from '../assets/home/char-tomato.png';
import lemon from '../assets/home/char-lemon.png';
import styles from './mainPage.module.css';

const CATEGORIES = [
  { label: 'Breakfast', value: 'BREAKFAST', image: breakfast },
  { label: 'Lunch', value: 'LUNCH', image: lunch },
  { label: 'Dinner', value: 'DINNER', image: dinner },
];

function MainPage() {
  const { recipes, getAllRecipes, isLoading, error } = useRecipe();

  useEffect(() => {
    getAllRecipes({ limit: 12 });
  }, []);

  const drink = recipes.find((recipe) => recipe.mealtype === 'DRINK');
  const dishes = recipes.filter((recipe) => recipe.id !== drink?.id).slice(0, 2);

  return (
    <div>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Carousel />

        <section className={styles.categories} aria-labelledby="category-heading">
          <h1 id="category-heading" className="visually-hidden">Browse recipes by meal</h1>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <Link key={category.value} to={`/search?mealtype=${category.value}`} className={styles.categoryCard}>
                <img src={category.image} alt="" />
                <span>{category.label}</span>
                <ArrowRightIcon size={30} />
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.join} aria-labelledby="join-title">
          <div className={styles.joinInner}>
            <div className={styles.joinCopy}>
              <h2 id="join-title">Join now!<br />Be a member of Foodiest</h2>
              <p>
                Set et risus sit amet velit viverra tincidunt. Etiam eget tempor arcu, in bibendum nibh.
                Duis sit amet nisi turpis. Nullam vitae velit a urna molestie venenatis.
              </p>
              <Button as={Link} to="/signin" variant="outline" icon={<ArrowRightIcon size={24} />}>
                Sign in now
              </Button>
            </div>
            <div className={styles.characters} aria-hidden="true">
              <img src={onion} alt="" />
              <img src={leek} alt="" />
              <img src={tomato} alt="" />
              <img src={lemon} alt="" />
            </div>
          </div>
        </section>

        <section className={styles.summer} aria-labelledby="summer-title">
          <div className={styles.summerIntro}>
            <h2 id="summer-title">Taste of summer</h2>
            <p>
              Enjoy light, refreshing drinks and easy seasonal dishes made for warm days. Each recipe features fresh
              ingredients and simple flavors that capture the best of summer. Find something new to cool off and unwind
              with this season.
            </p>
          </div>
          {isLoading && <p>Loading recipes…</p>}
          {error && <p role="alert" className={styles.error}>{error}</p>}
          {!isLoading && !error && recipes.length === 0 && (
            <p>No recipes yet. Be the first to <Link to="/postPage">share one</Link>.</p>
          )}
          {(drink || dishes.length > 0) && (
            <div className={styles.featureGrid}>
              <div className={styles.smallFeatures}>
                {dishes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
              </div>
              {drink && <div className={styles.largeFeature}><RecipeCard recipe={drink} size="large" /></div>}
            </div>
          )}
          <Link className={styles.allLink} to="/search">See all recipes <ArrowRightIcon size={24} /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default MainPage;
