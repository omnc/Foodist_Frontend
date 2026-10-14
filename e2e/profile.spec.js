import { expect, test } from '@playwright/test';
import { installMockApi, seedRecipe, seedSession } from './helpers/mockApi.js';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function signedInWithRecipes(page, count) {
  const state = await installMockApi(page);
  const me = await seedSession(page, state, 'sara@example.com');
  me.username = 'Sara Smith';
  me.bio = 'Home cook and baker.';
  for (let i = 1; i <= count; i += 1) {
    seedRecipe(state, me, { title: `Recipe ${i}`, ratings: [4, 5] });
  }
  return { state, me };
}

test.describe('Profile pages', () => {
  test('profile card, stats and saved count', async ({ page }) => {
    const { state, me } = await signedInWithRecipes(page, 3);
    state.saved.push({ id: 1, userID: me.id, recipeID: 1, note: null });
    await page.goto('/#/myPage');

    await expect(page.getByTestId('profile-name')).toHaveText('Sara Smith');
    await expect(page.getByTestId('profile-bio')).toHaveText('Home cook and baker.');
    await expect(page.getByTestId('stat-posts')).toHaveText('3');
    await expect(page.getByTestId('stat-ratings')).toHaveText('6');
    await expect(page.getByTestId('saved-link')).toContainText('1 saved recipes');
    await expect(page.getByRole('heading', { level: 1, name: 'My recipes (3)' })).toBeVisible();
    await expect(page.locator('article[data-testid^="recipe-card-"]')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'View all' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Add new recipe' }).click();
    await expect(page).toHaveURL(/#\/postPage$/);
  });

  test('profile previews six recipes and View all opens the full list', async ({ page }) => {
    await signedInWithRecipes(page, 8);
    await page.goto('/#/myPage');
    await expect(page.locator('article[data-testid^="recipe-card-"]')).toHaveCount(6);

    await page.getByRole('link', { name: 'View all' }).click();
    await expect(page).toHaveURL(/#\/myRecipes$/);
    await expect(page.locator('article[data-testid^="recipe-card-"]')).toHaveCount(8);

    await page.getByLabel('Sort recipes').selectOption('title');
    const titles = await page.locator('article h3').allTextContents();
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));

    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page).toHaveURL(/#\/myPage$/);
  });

  test('edit profile saves name, bio, photo and social links', async ({ page }) => {
    await signedInWithRecipes(page, 1);
    await page.goto('/#/myPage');
    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/#\/editProfile$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Edit profile' })).toBeVisible();
    await expect(page.getByTestId('edit-username')).toHaveValue('Sara Smith');

    await page.getByTestId('edit-username').fill('Chef Sara');
    await page.getByTestId('edit-bio').fill('Soups all year round.');
    await page.getByTestId('edit-facebook').fill('https://facebook.com/chef.sara');
    await page.getByTestId('edit-x').fill('https://x.com/chefsara');
    await page.getByTestId('edit-photo').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await page.getByTestId('edit-submit').click();

    await expect(page).toHaveURL(/#\/myPage$/);
    await expect(page.getByTestId('profile-name')).toHaveText('Chef Sara');
    await expect(page.getByTestId('profile-bio')).toHaveText('Soups all year round.');
    await expect(page.getByTestId('profile-card').getByRole('img', { name: /profile photo/ })).toHaveAttribute('src', /^data:image\/jpeg/);
    await expect(page.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://facebook.com/chef.sara');
    await expect(page.getByRole('link', { name: 'X', exact: true })).toHaveAttribute('href', 'https://x.com/chefsara');
    await expect(page.getByRole('link', { name: 'Instagram' })).toHaveCount(0);
  });

  test('cancel leaves the profile unchanged', async ({ page }) => {
    await signedInWithRecipes(page, 0);
    await page.goto('/#/editProfile');
    await page.getByTestId('edit-username').fill('Someone Else');
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/#\/myPage$/);
    await expect(page.getByTestId('profile-name')).toHaveText('Sara Smith');
    await expect(page.getByText("You haven't created any recipes yet.")).toBeVisible();
  });

  test('stored social links that are not http(s) are never rendered as links', async ({ page }) => {
    const { me } = await signedInWithRecipes(page, 0);
    await page.addInitScript((id) => {
      localStorage.setItem(`foodist:social-links:${id}`, JSON.stringify({ facebook: 'javascript:alert(1)', x: 'x.com/safe' }));
    }, me.id);
    await page.goto('/#/myPage');
    await expect(page.getByRole('link', { name: 'X', exact: true })).toHaveAttribute('href', 'https://x.com/safe');
    await expect(page.getByRole('link', { name: 'Facebook' })).toHaveCount(0);
  });

  test('profile pages require a login', async ({ page }) => {
    await installMockApi(page);
    await page.goto('/#/editProfile');
    await expect(page).toHaveURL(/#\/login$/);
    await page.goto('/#/myRecipes');
    await expect(page).toHaveURL(/#\/login$/);
  });
});
