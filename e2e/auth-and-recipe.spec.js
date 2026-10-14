import { expect, test } from '@playwright/test';
import { installMockApi } from './helpers/mockApi.js';

test.describe('Auth + recipe create/persist + save (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await installMockApi(page);
    await page.goto('/#/');
  });

  test('register then login restores session user id', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    const password = 'password123';

    await page.goto('/#/signin');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(password);
    await page.getByTestId('register-confirm').fill(password);
    await page.getByTestId('register-submit').click();
    await expect(page).toHaveURL(/#\/login/);

    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/#\/$/);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    // Reload — /auth/me mock should restore session without crash
    await page.reload();
    await expect(page.getByRole('heading', { level: 2, name: 'Taste of summer' })).toBeVisible();
  });

  test('login failure shows alert and does not navigate', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByTestId('login-email').fill('nobody@example.com');
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).toHaveURL(/#\/login/);
  });

  test('create recipe persists ingredients and directions after reload', async ({ page }) => {
    const email = `chef-${Date.now()}@example.com`;
    const password = 'password123';
    const title = `E2E Pasta ${Date.now()}`;

    await page.goto('/#/signin');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(password);
    await page.getByTestId('register-confirm').fill(password);
    await page.getByTestId('register-submit').click();
    await expect(page).toHaveURL(/#\/login/);
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/#\/$/);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('token'))).toBeTruthy();

    await page.goto('/#/postPage');
    await expect(page.getByTestId('post-form')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('post-title').fill(title);
    await page.getByTestId('post-description').fill('A mocked E2E recipe');
    await page.getByTestId('ingredient-heading-0').fill('Main');
    await page.getByTestId('ingredient-name-0-0').fill('Tomato');
    await page.getByTestId('ingredient-amount-0-0').fill('2');
    await page.getByTestId('ingredient-unit-0-0').fill('cups');
    await page.getByTestId('step-content-0').fill('Chop the tomatoes');
    await page.getByTestId('post-submit').click();

    await expect(page).toHaveURL(/#\/recipe\/\d+/);
    await expect(page.getByTestId('recipe-title')).toHaveText(title);
    await expect(page.getByTestId('recipe-ingredients')).toContainText('Tomato');
    await expect(page.getByTestId('recipe-directions')).toContainText('Chop the tomatoes');

    // Reload detail — mock GET must still return nested data
    await page.reload();
    await expect(page.getByTestId('recipe-title')).toHaveText(title);
    await expect(page.getByTestId('recipe-ingredient-0')).toContainText('Tomato');
    await expect(page.getByTestId('recipe-step-0')).toContainText('Chop the tomatoes');
  });

  test('save and unsave toggles on recipe detail', async ({ page }) => {
    const email = `saver-${Date.now()}@example.com`;
    const password = 'password123';
    const title = `Saveable ${Date.now()}`;

    await page.goto('/#/signin');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(password);
    await page.getByTestId('register-confirm').fill(password);
    await page.getByTestId('register-submit').click();
    await expect(page).toHaveURL(/#\/login/);
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/#\/$/);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('token'))).toBeTruthy();

    await page.goto('/#/postPage');
    await expect(page.getByTestId('post-form')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('post-title').fill(title);
    await page.getByTestId('post-description').fill('Save me');
    await page.getByTestId('ingredient-heading-0').fill('Seasoning');
    await page.getByTestId('ingredient-name-0-0').fill('Salt');
    await page.getByTestId('ingredient-amount-0-0').fill('1');
    await page.getByTestId('ingredient-unit-0-0').fill('tsp');
    await page.getByTestId('step-content-0').fill('Mix');
    await page.getByTestId('post-submit').click();
    await expect(page.getByTestId('recipe-title')).toHaveText(title);

    const saveBtn = page.getByTestId('save-recipe-btn');
    await expect(saveBtn).toHaveAttribute('aria-pressed', 'false');
    await saveBtn.click();
    await expect(saveBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(saveBtn).toContainText('Saved');

    await saveBtn.click();
    await expect(saveBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(saveBtn).toContainText('Save');
    await expect(saveBtn).not.toContainText('Saved');
  });
});

