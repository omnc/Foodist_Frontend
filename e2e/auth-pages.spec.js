import { expect, test } from '@playwright/test';
import { installMockApi, seedSession } from './helpers/mockApi.js';

test.describe('Auth pages (mocked API)', () => {
  test('sign up keeps the username and applies it after the first login', async ({ page }) => {
    const state = await installMockApi(page);
    const email = `chef-${Date.now()}@example.com`;
    await page.goto('/#/signin');
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-username').fill('Chef Sara');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm').fill('password123');
    await page.getByTestId('register-submit').click();
    await expect(page).toHaveURL(/#\/login/);

    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill('password123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/#\/$/);
    await expect.poll(() => state.users.find((u) => u.email === email)?.username).toBe('Chef Sara');
  });

  test('sign up flags an already registered email on the email field', async ({ page }) => {
    await installMockApi(page);
    const register = async () => {
      await page.goto('/#/signin');
      await page.getByTestId('register-email').fill('dup@example.com');
      await page.getByTestId('register-password').fill('password123');
      await page.getByTestId('register-confirm').fill('password123');
      await page.getByTestId('register-submit').click();
    };
    await register();
    await expect(page).toHaveURL(/#\/login/);
    await register();
    const error = page.getByTestId('register-email-error');
    await expect(error).toHaveText('This email is already registered');
    await expect(page.getByTestId('register-email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('sign up rejects mismatched passwords before calling the API', async ({ page }) => {
    await installMockApi(page);
    await page.goto('/#/signin');
    await page.getByTestId('register-email').fill('a@example.com');
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm').fill('password124');
    await page.getByTestId('register-submit').click();
    await expect(page.getByTestId('register-confirm-error')).toHaveText('Passwords do not match');
    await expect(page).toHaveURL(/#\/signin/);
  });

  test('login failure marks both fields invalid', async ({ page }) => {
    await installMockApi(page);
    await page.goto('/#/login');
    await page.getByTestId('login-email').fill('nobody@example.com');
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('login-password')).toHaveAttribute('aria-invalid', 'true');
  });

  test('forgot password is honest that email reset is not available', async ({ page }) => {
    await installMockApi(page);
    await page.goto('/#/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/#\/forgotPassword/);
    await page.getByTestId('forgot-email').fill('a@example.com');
    await page.getByTestId('forgot-submit').click();
    await expect(page.getByTestId('forgot-notice')).toContainText('not available yet');
  });

  test('change password needs a session', async ({ page }) => {
    await installMockApi(page);
    await page.goto('/#/changePassword');
    await expect(page).toHaveURL(/#\/login/);
  });

  test('change password checks the rules, the current password, then updates', async ({ page }) => {
    const state = await installMockApi(page);
    await seedSession(page, state, 'sara.smith@example.com');
    await page.goto('/#/changePassword');

    const rules = page.getByTestId('password-rules').locator('li');
    await page.getByTestId('change-new').fill('abc');
    await expect(rules.nth(0)).toHaveAttribute('data-met', 'false');
    await expect(rules.nth(1)).toHaveAttribute('data-met', 'true');
    await page.getByTestId('change-new').fill('Abcdefg1');
    for (let i = 0; i < 4; i++) await expect(rules.nth(i)).toHaveAttribute('data-met', 'true');

    await page.getByTestId('change-current').fill('not-my-password');
    await page.getByTestId('change-confirm').fill('Abcdefg1');
    await page.getByTestId('change-submit').click();
    await expect(page.getByTestId('change-current-error')).toHaveText('Current password is incorrect');

    const current = state.users.find((u) => u.email === 'sara.smith@example.com').password;
    await page.getByTestId('change-current').fill(current);
    await page.getByTestId('change-submit').click();
    await expect(page.getByTestId('change-success')).toBeVisible();
    expect(state.users.find((u) => u.email === 'sara.smith@example.com').password).toBe('Abcdefg1');
  });

  test('remember me keeps the email for the next visit', async ({ page }) => {
    const state = await installMockApi(page);
    state.users.push({ id: state.nextUserId++, email: 'chef@example.com', password: 'password123', username: null });
    await page.goto('/#/login');
    await page.getByTestId('login-email').fill('chef@example.com');
    await page.getByTestId('login-password').fill('password123');
    await page.getByLabel('Remember me').check();
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/#\/$/);
    await page.goto('/#/login');
    await page.reload();
    await expect(page.getByTestId('login-email')).toHaveValue('chef@example.com');
    await expect(page.getByLabel('Remember me')).toBeChecked();
  });
});
