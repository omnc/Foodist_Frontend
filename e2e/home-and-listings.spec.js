import { expect, test } from '@playwright/test';
import { installMockApi, seedRecipe } from './helpers/mockApi.js';

function addRecipes(state) {
  const author = { id: 1, email: 'chef@example.com' };
  seedRecipe(state, author, { title: 'Zucchini Soup', mealtype: 'LUNCH', ratings: [4, 5] });
  seedRecipe(state, author, { title: 'Apple Tart', mealtype: 'DESSERT', ratings: [5, 5] });
  seedRecipe(state, author, { title: 'Summer Drink', mealtype: 'DRINK', ratings: [3, 4] });
}

test.describe('Home and listing design controls', () => {
  test('home category cards preserve their meal filters', async ({ page }) => {
    const state = await installMockApi(page);
    addRecipes(state);
    await page.goto('/#/');
    await page.getByRole('link', { name: /Breakfast/ }).click();
    await expect(page).toHaveURL(/#\/search\?mealtype=BREAKFAST$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Meals' })).toBeVisible();
  });

  test('meal tabs and sort controls update the listing without losing functionality', async ({ page }) => {
    const state = await installMockApi(page);
    addRecipes(state);
    await page.goto('/#/search?mealtype=DINNER');
    await expect(page.getByText('Total 3 recipes')).toBeVisible();
    await page.getByRole('button', { name: 'Drinks' }).click();
    await expect(page).toHaveURL(/#\/search\?mealtype=DRINK$/);

    await page.getByLabel('Sort recipes').selectOption('title');
    const titles = await page.getByTestId('listing-results').locator('article h3').allTextContents();
    expect(titles).toEqual(['Apple Tart', 'Summer Drink', 'Zucchini Soup']);
  });

  test('search result control can clear the current query', async ({ page }) => {
    const state = await installMockApi(page);
    addRecipes(state);
    await page.goto('/#/search?q=soup');
    await expect(page.getByRole('heading', { level: 1, name: 'Find recipes' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page).toHaveURL(/#\/search$/);
    await expect(page.getByTestId('listing-search')).toHaveValue('');
  });
});
