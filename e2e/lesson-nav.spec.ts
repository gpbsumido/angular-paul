import { expect, test } from '@playwright/test';

// The unit specs drive ScrollSpy with a fake IntersectionObserver, which can
// only prove the wiring. Whether the highlight follows real scrolling needs a
// real browser.
test.describe('lesson "On this page" nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/thoughts/angular-10-directives');
    await expect(page.getByRole('navigation', { name: 'On this page' })).toBeVisible();
  });

  test('jumping to a section focuses its heading and marks it current', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'On this page' });
    await nav.getByRole('button', { name: 'Pitfalls' }).click();

    await expect(page.locator('h2#pitfalls')).toBeFocused();
    await expect(nav.getByRole('button', { name: 'Pitfalls' })).toHaveAttribute('aria-current', 'location');
  });

  test('the highlight follows the reader while scrolling', async ({ page }) => {
    await page.locator('h2#expert').evaluate((heading) => heading.scrollIntoView({ block: 'start' }));

    const nav = page.getByRole('navigation', { name: 'On this page' });
    await expect(nav.getByRole('button', { name: 'Expert' })).toHaveAttribute('aria-current', 'location');
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
  });
});
