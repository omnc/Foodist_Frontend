import { expect, test } from '@playwright/test';
import { installMockApi, seedRecipe, seedSession } from './helpers/mockApi.js';

test.describe('Ratings, recipe cards, my recipes (mocked API)', () => {
  let state;

  test.beforeEach(async ({ page }) => {
    state = await installMockApi(page);
  });

  test('search cards show average rating or "No ratings yet"', async ({ page }) => {
    const cook = await seedSession(page, state);
    const unrated = seedRecipe(state, cook, { title: 'Plain Toast', mealtype: 'BREAKFAST' });
    const rated = seedRecipe(state, cook, { title: 'Great Stew', ratings: [3, 4] });

    await page.goto('/#/search?q=a');
    const unratedCard = page.getByTestId(`recipe-card-${unrated.id}`);
    await expect(unratedCard).toContainText('Breakfast');
    await expect(unratedCard).toContainText('Plain Toast');
    await expect(unratedCard.getByTestId('rating-summary')).toHaveText('No ratings yet');
    await expect(unratedCard.getByTestId(`recipe-card-heart-${unrated.id}`)).toBeVisible();

    const ratedCard = page.getByTestId(`recipe-card-${rated.id}`);
    await expect(ratedCard.getByTestId('rating-summary')).toContainText('3.5');
    await expect(ratedCard.getByTestId('rating-summary')).toHaveAttribute('aria-label', /3\.5 out of 5 from 2 ratings/);
  });

  test('recipe page trending cards use real ratings, never a default', async ({ page }) => {
    const cook = await seedSession(page, state);
    const current = seedRecipe(state, cook, { title: 'Current' });
    seedRecipe(state, cook, { title: 'Unrated Other' });
    seedRecipe(state, cook, { title: 'Rated Other', ratings: [5] });

    await page.goto(`/#/recipe/${current.id}`);
    await expect(page.getByTestId('recipe-title')).toHaveText('Current');
    const sidebar = page.locator('.publish-sidebar');
    await expect(sidebar).toContainText('No ratings yet');
    await expect(sidebar).toContainText('5.0');
    await expect(sidebar).not.toContainText('4.4');
    await expect(page.locator('.recipe-header .rating')).toContainText('No ratings yet');
  });

  test('comment requires a star rating, allows blank text, and updates the average', async ({ page }) => {
    const cook = await seedSession(page, state);
    const recipe = seedRecipe(state, cook, { title: 'Rate Me' });

    await page.goto(`/#/recipe/${recipe.id}`);
    const submit = page.getByTestId('comment-submit');
    await expect(submit).toBeDisabled();
    await page.getByTestId('comment-rating').getByRole('button', { name: '4 stars' }).click();
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.locator('.recipe-header .rating')).toContainText('4');
    await expect(page.locator('.comments-list .comment-item')).toHaveCount(1);
    await expect(submit).toBeDisabled();
  });

  test('profile lists only my recipes as cards', async ({ page }) => {
    const me = await seedSession(page, state, 'me@example.com');
    const other = { id: 500, email: 'other@example.com' };
    seedRecipe(state, me, { title: 'My Curry', ratings: [4] });
    seedRecipe(state, other, { title: 'Not Mine' });

    await page.goto('/#/myPage');
    await expect(page.getByRole('heading', { level: 1, name: 'My Recipes' })).toBeVisible();
    const cards = page.locator('article[data-testid^="recipe-card-"]');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('My Curry');
    await expect(cards).toContainText('4.0');
  });

  test('saved list shows cards; heart unsaves and removes the card', async ({ page }) => {
    const me = await seedSession(page, state);
    const recipe = seedRecipe(state, me, { title: 'Saved Soup', ratings: [2, 3] });
    state.saved.push({ id: 1, userID: me.id, recipeID: recipe.id, note: null });

    await page.goto('/#/saved');
    const card = page.getByTestId(`recipe-card-${recipe.id}`);
    await expect(card).toContainText('Saved Soup');
    await expect(card.getByTestId('rating-summary')).toContainText('2.5');
    const heart = card.getByTestId(`recipe-card-heart-${recipe.id}`);
    await expect(heart).toHaveAttribute('aria-pressed', 'true');
    await heart.click();
    await expect(page.getByText('You have not saved any recipes yet.')).toBeVisible();
    expect(state.saved).toHaveLength(0);
  });

  test('save failure on the recipe page shows a readable error', async ({ page }) => {
    const me = await seedSession(page, state);
    const recipe = seedRecipe(state, me, { title: 'Broken Save' });
    await page.route('**/saved-recipes/*', async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error', requestId: 'req-123' }),
        });
      }
      return route.fallback();
    });

    await page.goto(`/#/recipe/${recipe.id}`);
    await page.getByTestId('save-recipe-btn').click();
    await expect(page.getByTestId('save-error')).toContainText('ref req-123');
    await expect(page.getByTestId('save-recipe-btn')).toHaveAttribute('aria-pressed', 'false');
  });
});
