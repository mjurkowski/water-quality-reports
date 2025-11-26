import { test, expect } from '@playwright/test';

test.describe('Map Viewing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application (using real API)
    await page.goto('/');
  });

  test('should display the map on homepage', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Check that map is visible
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();

    // Check map has correct dimensions
    const mapSection = page.locator('#map');
    await expect(mapSection).toBeVisible();
  });

  test('should display mode toggle button', async ({ page }) => {
    // Check for mode toggle button
    const modeButton = page.getByRole('button', { name: /Kliknij aby włączyć dodawanie|Tryb dodawania aktywny/ });
    await expect(modeButton).toBeVisible();
  });

  test('should toggle between view and add mode', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Initial state should be view mode
    const modeButton = page.getByRole('button', { name: /Kliknij aby włączyć dodawanie/ });
    await expect(modeButton).toBeVisible();

    // Click to switch to add mode
    await modeButton.click();

    // Check button text changed
    await expect(page.getByRole('button', { name: /Tryb dodawania aktywny/ })).toBeVisible();

    // Click again to switch back to view mode
    await page.getByRole('button', { name: /Tryb dodawania aktywny/ }).click();

    // Check button text changed back
    await expect(page.getByRole('button', { name: /Kliknij aby włączyć dodawanie/ })).toBeVisible();
  });

  test('should display floating action button (FAB)', async ({ page }) => {
    // Check for FAB button with Plus icon
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await expect(fab).toBeVisible();
  });

  test('should display report markers on map', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Scroll to map section to ensure it's in viewport
    await page.locator('#map').scrollIntoViewIfNeeded();

    // Wait for Leaflet to render - markers take time to appear
    await page.waitForTimeout(3000);

    // Wait for markers to load (marker cluster or individual markers)
    // Use longer timeout as Leaflet needs time to process and render
    await page.waitForSelector('.leaflet-marker-icon, .marker-cluster', { timeout: 15000 });

    // Check that at least one marker exists
    const markers = page.locator('.leaflet-marker-icon, .marker-cluster');
    const count = await markers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show report details when clicking marker in view mode', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Scroll to map section
    await page.locator('#map').scrollIntoViewIfNeeded();

    // Wait for Leaflet to render
    await page.waitForTimeout(3000);

    // Wait for markers
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 15000 });

    // Ensure we're in view mode
    const modeButton = page.locator('button').filter({ hasText: /Kliknij aby włączyć dodawanie|Tryb dodawania aktywny/ });
    const buttonText = await modeButton.textContent();
    if (buttonText?.includes('Tryb dodawania aktywny')) {
      await modeButton.click(); // Switch to view mode
    }

    // Click on the first marker
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    await firstMarker.click();

    // Check that report details drawer appears
    await expect(page.getByText('Szczegóły zgłoszenia')).toBeVisible({ timeout: 5000 });

    // Check that drawer contains expected fields
    await expect(page.getByText('Typy problemów')).toBeVisible();
    await expect(page.getByText('Lokalizacja')).toBeVisible();
    await expect(page.getByText('Data zgłoszenia')).toBeVisible();
  });

  test('should close report details drawer', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Scroll to map section
    await page.locator('#map').scrollIntoViewIfNeeded();

    // Wait for Leaflet to render
    await page.waitForTimeout(3000);

    await page.waitForSelector('.leaflet-marker-icon', { timeout: 15000 });

    // Click on marker to open drawer
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    await firstMarker.click();

    // Wait for drawer to appear
    await expect(page.getByText('Szczegóły zgłoszenia')).toBeVisible({ timeout: 5000 });

    // Click close button
    const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeButton.click();

    // Check drawer is closed
    await expect(page.getByText('Szczegóły zgłoszenia')).not.toBeVisible();
  });

  test('should show popup on marker hover', async ({ page }) => {
    // Wait for map and markers to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Scroll to map section
    await page.locator('#map').scrollIntoViewIfNeeded();

    // Wait for Leaflet to render
    await page.waitForTimeout(3000);

    await page.waitForSelector('.leaflet-marker-icon', { timeout: 15000 });

    // Click on marker to trigger popup
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    await firstMarker.click();

    // Wait a bit for popup
    await page.waitForTimeout(500);

    // Check that popup appears
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();
  });

  test('should navigate between sections using header', async ({ page }) => {
    // Check that header navigation exists
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    // Click on map section link if it exists in nav
    const mapLink = page.getByRole('link', { name: /Mapa/ });
    if (await mapLink.isVisible()) {
      await mapLink.click();

      // Check we're at map section
      await expect(page.locator('#map')).toBeInViewport();
    }
  });
});
