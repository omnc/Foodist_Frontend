import { expect, test } from '@playwright/test';
import { installMockApi } from './helpers/mockApi.js';

test.describe('Layout regressions (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installMockApi(page);
  });

  test('search filters are not hidden behind the fixed header', async ({ page }) => {
    await page.goto('/#/search?q=food');
    const header = await page.locator('.header').boundingBox();
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

  test('each category submenu opens under its own label', async ({ page }) => {
    await page.goto('/#/');
    for (const type of ['meal', 'ingredient', 'cuisine', 'occasion', 'cooking-tip']) {
      const item = page.getByTestId(`category-${type}`);
      await item.hover();
      const label = await item.locator('.category-dropdown-header-item').boundingBox();
      const submenu = item.locator('.category-submenu');
      await expect(submenu).toBeVisible();
      const box = await submenu.boundingBox();
      expect(Math.abs(box.x - label.x)).toBeLessThan(3);
      expect(box.y).toBeGreaterThanOrEqual(label.y + label.height - 1);
      await expect(page.locator('.category-submenu:visible')).toHaveCount(1);
    }
  });

  test('About Us has no submenu and links to the About Us page', async ({ page }) => {
    await page.goto('/#/');
    const about = page.getByTestId('category-about-us');
    await about.hover();
    await expect(about.locator('.category-submenu')).toHaveCount(0);
    await expect(page.locator('.category-submenu:visible')).toHaveCount(0);
    await about.getByRole('link', { name: 'About Us' }).click();
    await expect(page).toHaveURL(/#\/aboutUs$/);
    await expect(page.getByRole('heading', { level: 1, name: 'About Us' })).toBeVisible();
  });
});
