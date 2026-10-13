import { expect, test } from '@playwright/test';
import { installMockApi, seedSession } from './helpers/mockApi.js';

const multipartField = (raw, name) => {
  const m = raw.match(new RegExp(`name="${name}"\\r?\\n\\r?\\n([\\s\\S]*?)\\r?\\n--`));
  return m ? m[1] : null;
};

test.describe('Ingredient groups on the post page (mocked API)', () => {
  let state;

  test.beforeEach(async ({ page }) => {
    state = await installMockApi(page);
    await seedSession(page, state);
    await page.goto('/#/postPage');
    await expect(page.getByTestId('post-form')).toBeVisible();
  });

  async function fillBasics(page) {
    await page.getByTestId('post-title').fill('Lasagne');
    await page.getByTestId('post-description').fill('Layers');
    await page.getByTestId('step-content-0').fill('Assemble and bake');
  }

  async function fillGroup(page, groupIndex, heading, [name, amount, unit]) {
    await page.getByTestId(`ingredient-heading-${groupIndex}`).fill(heading);
    await page.getByTestId(`ingredient-name-${groupIndex}-0`).fill(name);
    await page.getByTestId(`ingredient-amount-${groupIndex}-0`).fill(amount);
    await page.getByTestId(`ingredient-unit-${groupIndex}-0`).fill(unit);
  }

  test('"Add heading" inserts an identical group above the first one', async ({ page }) => {
    await page.getByTestId('ingredient-heading-0').fill('Original');
    await page.getByTestId('add-ingredient-group').click();

    await expect(page.locator('.ingredient-group')).toHaveCount(2);
    await expect(page.getByTestId('ingredient-heading-0')).toHaveValue('');
    await expect(page.getByTestId('ingredient-heading-1')).toHaveValue('Original');
    const newGroup = page.getByTestId('ingredient-group-0');
    await expect(newGroup.locator('.ingredient-labels')).toBeVisible();
    await expect(newGroup.locator('.ingredient-item')).toHaveCount(1);
    await expect(newGroup.getByTestId('add-ingredient-0')).toBeVisible();

    await page.getByTestId('add-ingredient-group').click();
    await expect(page.locator('.ingredient-group')).toHaveCount(3);
    await expect(page.getByTestId('ingredient-heading-2')).toHaveValue('Original');
  });

  test('blank headings are rejected before submit', async ({ page }) => {
    await fillBasics(page);
    await fillGroup(page, 0, '   ', ['Salt', '1', 'tsp']);
    let posted = false;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().endsWith('/recipes')) posted = true;
    });
    await page.getByTestId('post-submit').click();
    await expect(page.getByTestId('post-error')).toHaveText('Every ingredient group needs a heading');
    expect(posted).toBe(false);
  });

  test('groups are submitted and shown on the recipe page in post-page order', async ({ page }) => {
    await fillBasics(page);
    await fillGroup(page, 0, 'For the pasta', ['Lasagne sheets', '12', 'pcs']);
    await page.getByTestId('add-ingredient-group').click();
    await fillGroup(page, 0, 'For the sauce', ['Tomato', '2', 'cups']);

    const requestPromise = page.waitForRequest((req) => req.method() === 'POST' && req.url().endsWith('/recipes'));
    await page.getByTestId('post-submit').click();
    const raw = (await requestPromise).postDataBuffer().toString('utf8');
    const groups = JSON.parse(multipartField(raw, 'ingredientGroups'));
    expect(groups.map((g) => g.heading)).toEqual(['For the sauce', 'For the pasta']);
    expect(JSON.parse(multipartField(raw, 'ingredients')).map((i) => i.name)).toEqual(['Tomato', 'Lasagne sheets']);

    await expect(page.getByTestId('recipe-title')).toHaveText('Lasagne');
    const headings = page.locator('.ingredient-group-heading');
    await expect(headings).toHaveText(['For the sauce', 'For the pasta']);
    await expect(page.getByTestId('recipe-ingredient-group-0')).toContainText('Tomato');
    await expect(page.getByTestId('recipe-ingredient-group-1')).toContainText('Lasagne sheets');
  });
});
