import { test, expect } from '@playwright/test';
import { checkA11y } from './helpers/axe';

test('desktop loads with menu bar and dock', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Menu bar is visible
  const menuBar = page.locator('app-menu-bar');
  await expect(menuBar).toBeVisible();

  // Dock is visible
  const dock = page.locator('app-dock');
  await expect(dock).toBeVisible();

  // Desktop icons are present
  const icons = page.locator('app-desktop-icon');
  await expect(icons.first()).toBeVisible();
});

test('desktop has no axe violations', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await checkA11y(page, '/ (desktop)');
});

test('clicking a dock icon opens a window', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click the About dock icon (index 1)
  const dockIcons = page.locator('.dock-icon');
  await dockIcons.nth(1).click();

  // A window should appear
  const window = page.locator('app-window');
  await expect(window.first()).toBeVisible();
});

test('opened window has no axe violations', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Open About
  const dockIcons = page.locator('.dock-icon');
  await dockIcons.nth(1).click();
  await expect(page.locator('app-window').first()).toBeVisible();

  await checkA11y(page, 'desktop with About window open');
});
