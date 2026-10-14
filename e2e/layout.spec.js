import { expect, test } from '@playwright/test';
import { installMockApi } from './helpers/mockApi.js';

test.describe('Layout regressions (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installMockApi(page);
  });

  test('search filters sit below the header', async ({ page }) => {
    await page.goto('/#/search?q=food');
    const header = await page.getByTestId('site-header').boundingBox();
    const heading = await page.getByRole('heading', { level: 1, name: 'Find recipes' }).boundingBox();
    const form = await page.locator('main form').boundingBox();
    expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
    expect(form.y).toBeGreaterThanOrEqual(header.y + header.height);
  });

  test('carousel shows exactly the selected slide', async ({ page }) => {
    await page.goto('/#/');
    const visibleSlide = () =>
      page.evaluate(() => {
        const inner = document.querySelector('.carousel-inner').getBoundingClientRect();
        const slides = [...document.querySelectorAll('.carousel-slide')];
        return slides.findIndex((s) => {
          const r = s.getBoundingClientRect();
          return Math.abs(r.left - inner.left) < 2 && Math.abs(r.right - inner.right) < 2;
        });
      });

    await expect.poll(visibleSlide).toBe(0);
    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(visibleSlide).toBe(1);
    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(visibleSlide).toBe(2);
    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(visibleSlide).toBe(0);
    await page.getByRole('button', { name: 'Previous slide' }).click();
    await expect.poll(visibleSlide).toBe(2);
    await page.getByRole('button', { name: 'Go to slide 2' }).click();
    await expect.poll(visibleSlide).toBe(1);
  });

  const MENU = {
    meal: ['Breakfast', 'Lunch', 'Dinner', 'Appetizer', 'Dessert', 'Drink', 'Bread', 'Side Dish'],
    ingredient: ['Chicken', 'Beef', 'Pork', 'Seafood', 'Egg', 'Rice', 'Fruits', 'Vegetable'],
    cuisine: ['Italian', 'French', 'Greek', 'Indian', 'Chinese', 'Korean', 'Japanese', 'Filipino', 'Mexican'],
    occasion: ['Passover', 'Easter', 'Thanksgiving', 'Holiday', 'Christmas'],
    'cooking-tip': ['Knife Tips', 'Ingredient Prep', 'Baking Tips', 'BBQ Tips', 'Preserving Tips'],
  };

  test('hovering the bar opens one panel with every column aligned under its label', async ({ page }) => {
    await page.goto('/#/');
    const visibleSubmenus = page.getByTestId('category-nav').locator('ul ul:visible');
    const nav = page.getByTestId('category-nav');
    const labels = nav.locator(':scope > ul > li > :is(button, a)');
    await expect(labels).toHaveText(['Meals', 'Ingredients', 'Cuisines', 'Occasions', 'Cooking Tips', 'About us']);
    await expect(visibleSubmenus).toHaveCount(0);

    await page.getByTestId('category-cuisine').getByRole('button', { name: 'Cuisines' }).hover();
    await expect(visibleSubmenus).toHaveCount(5);

    const navBox = await nav.locator(':scope > ul').boundingBox();
    const tops = [];
    for (const [type, items] of Object.entries(MENU)) {
      const item = page.getByTestId(`category-${type}`);
      const label = await item.locator(':scope > :is(button, a)').boundingBox();
      const submenu = item.getByRole('list');
      await expect(submenu.locator('li')).toHaveText(items);
      const box = await submenu.boundingBox();
      expect(Math.abs(box.x - label.x)).toBeLessThan(3);
      expect(box.y).toBeGreaterThanOrEqual(label.y + label.height - 1);
      tops.push(box.y);
    }
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
    const panel = await nav.locator(':scope > ul').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return { display: before.display, width: parseFloat(before.width) };
    });
    expect(panel.display).toBe('block');
    expect(panel.width).toBeGreaterThanOrEqual(navBox.width - 1);
  });

  test('the panel overlays the page instead of pushing it down', async ({ page }) => {
    await page.goto('/#/');
    const visibleSubmenus = page.getByTestId('category-nav').locator('ul ul:visible');
    const next = page.getByTestId('site-header').locator('+ *');
    const before = await next.boundingBox();
    await page.getByTestId('category-meal').hover();
    await expect(visibleSubmenus).toHaveCount(5);
    expect((await next.boundingBox()).y).toBe(before.y);
  });

  test('keyboard focus opens the panel and links keep their targets', async ({ page }) => {
    await page.goto('/#/');
    const visibleSubmenus = page.getByTestId('category-nav').locator('ul ul:visible');
    await page.getByTestId('category-meal').getByRole('button', { name: 'Meals' }).focus();
    await expect(visibleSubmenus).toHaveCount(5);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Breakfast' })).toBeFocused();
    await page.getByTestId('category-meal').getByRole('button', { name: 'Side Dish' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/search\?mealtype=SIDEDISH$/);

    await page.goto('/#/');
    await page.getByTestId('category-cuisine').getByRole('button', { name: 'Cuisines' }).focus();
    await page.getByTestId('category-cuisine').getByRole('button', { name: 'Korean' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/search\?q=Korean$/);
  });

  test('About us has an empty column and links to the About Us page', async ({ page }) => {
    await page.goto('/#/');
    const visibleSubmenus = page.getByTestId('category-nav').locator('ul ul:visible');
    const about = page.getByTestId('category-about-us');
    await about.hover();
    await expect(about.getByRole('list')).toHaveCount(0);
    await expect(visibleSubmenus).toHaveCount(5);
    await about.getByRole('link', { name: 'About us' }).click();
    await expect(page).toHaveURL(/#\/aboutUs$/);
    await expect(page.getByRole('heading', { level: 1, name: 'About Us' })).toBeVisible();
  });
});
