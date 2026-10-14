import { test, expect } from '@playwright/test';
import { installMockApi, seedSession, seedRecipe } from './helpers/mockApi.js';

test.describe('Recipe detail page (mocked API)', () => {
  let state;
  test.beforeEach(async ({ page }) => {
    state = await installMockApi(page);
  });

  test('ingredient checkboxes toggle, facts and breadcrumb render', async ({ page }) => {
    const cook = await seedSession(page, state);
    const recipe = seedRecipe(state, cook, { title: 'Checklist Soup', mealtype: 'LUNCH' });
    recipe.servingSize = 4;
    recipe.prepTime = 10;
    recipe.cookTime = 20;
    recipe.ingredientGroups = [{ heading: 'Base', items: [{ name: 'Onion' }, { name: 'Stock' }] }];
    recipe.descriptionBlocks = [{ id: 1, step: 1, content: 'Simmer gently' }];
    recipe.note = 'Keeps for two days';

    await page.goto(`/#/recipe/${recipe.id}`);
    const onion = page.getByTestId('recipe-ingredient-0').getByRole('checkbox');
    await expect(onion).not.toBeChecked();
    await onion.check();
    await expect(onion).toBeChecked();
    await onion.uncheck();
    await expect(onion).not.toBeChecked();
    await page.getByTestId('recipe-ingredient-1').getByText('Stock').click();
    await expect(page.getByTestId('recipe-ingredient-1').getByRole('checkbox')).toBeChecked();

    await expect(page.getByText('30 mins')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Lunch');
    await expect(page.getByTestId('recipe-step-0')).toContainText('Simmer gently');
    await expect(page.getByRole('heading', { name: 'Note' })).toBeVisible();
  });
});
