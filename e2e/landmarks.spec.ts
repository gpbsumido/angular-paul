import { test, expect } from '@playwright/test';

test.describe('Landmarks and semantic structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page has a navigation landmark (menu bar)', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('dock icons have accessible labels', async ({ page }) => {
    const dockIcons = page.locator('.dock-icon');
    const count = await dockIcons.count();
    expect(count).toBeGreaterThan(0);

    // Each dock icon should have a visible label
    for (let i = 0; i < count; i++) {
      const label = dockIcons.nth(i).locator('.dock-icon-label');
      await expect(label).toBeAttached();
    }
  });

  test('window traffic light buttons have aria-labels', async ({ page }) => {
    // Open a window first
    const dockIcons = page.locator('.dock-icon');
    await dockIcons.nth(1).click();
    await expect(page.locator('app-window').first()).toBeVisible();

    const closeBtn = page.locator('.traffic-close');
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close');

    const minimizeBtn = page.locator('.traffic-minimize');
    await expect(minimizeBtn).toHaveAttribute('aria-label', 'Minimize');

    const maximizeBtn = page.locator('.traffic-maximize');
    await expect(maximizeBtn).toHaveAttribute('aria-label', 'Maximize');
  });

  test('spotlight search input has accessible placeholder', async ({ page }) => {
    // Open spotlight with the menu bar button
    const spotlightTrigger = page.locator('.spotlight-trigger');
    await spotlightTrigger.click();

    const input = page.locator('.spotlight-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Spotlight Search');
  });
});
