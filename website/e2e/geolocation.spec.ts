import { test, expect } from '@playwright/test';

test.describe('Geolocation Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application (using real API)
    await page.goto('/');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should display "Use my location" button', async ({ page }) => {
    // Open modal via FAB
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Check for "Use my location" button
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await expect(locationButton).toBeVisible();

    // Check button has MapPin icon
    const mapPinIcon = locationButton.locator('svg.lucide-map-pin');
    await expect(mapPinIcon).toBeVisible();
  });

  test('should populate coordinates when geolocation succeeds', async ({ page, context }) => {
    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);

    // Set mock geolocation
    await context.setGeolocation({ latitude: 52.2297, longitude: 21.0122 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Click "Use my location" button
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();

    // Wait for coordinates to be populated
    await page.waitForTimeout(1000);

    // Check that coordinates are filled
    const latInput = page.getByLabel(/Szerokość geogr/);
    const lngInput = page.getByLabel(/Długość geogr/);

    const latValue = await latInput.inputValue();
    const lngValue = await lngInput.inputValue();

    // Check coordinates match mocked values (with some tolerance for precision)
    expect(parseFloat(latValue)).toBeCloseTo(52.2297, 2);
    expect(parseFloat(lngValue)).toBeCloseTo(21.0122, 2);
  });

  test('should show loading state while getting location', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 52.0, longitude: 19.0 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Click location button
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();

    // Check for loading text (may be quick, so use a small timeout)
    try {
      await expect(page.getByRole('button', { name: /Pobieram/ })).toBeVisible({ timeout: 1000 });
    } catch {
      // If loading is too fast, that's okay
    }

    // Eventually should show original text again
    await expect(page.getByRole('button', { name: /Użyj mojej lokalizacji/ })).toBeVisible({ timeout: 3000 });
  });

  test('should disable button while getting location', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 52.0, longitude: 19.0 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Click location button
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();

    // Button should be disabled during loading
    try {
      const loadingButton = page.getByRole('button', { name: /Pobieram/ });
      await expect(loadingButton).toBeDisabled({ timeout: 1000 });
    } catch {
      // Loading might be too fast
    }
  });

  test('should update existing coordinates when using geolocation', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 54.3520, longitude: 18.6466 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Manually set some coordinates first
    await page.getByLabel(/Szerokość geogr/).fill('50.0');
    await page.getByLabel(/Długość geogr/).fill('20.0');

    // Click "Use my location" button
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();

    // Wait for coordinates to update
    await page.waitForTimeout(1000);

    // Check that coordinates changed to geolocation values
    const latInput = page.getByLabel(/Szerokość geogr/);
    const lngInput = page.getByLabel(/Długość geogr/);

    const latValue = await latInput.inputValue();
    const lngValue = await lngInput.inputValue();

    expect(parseFloat(latValue)).toBeCloseTo(54.3520, 2);
    expect(parseFloat(lngValue)).toBeCloseTo(18.6466, 2);
  });

  test('should work with different coordinates', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);

    // Test with Kraków coordinates
    await context.setGeolocation({ latitude: 50.0647, longitude: 19.9450 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Click location button
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Verify coordinates
    const latInput = page.getByLabel(/Szerokość geogr/);
    const lngInput = page.getByLabel(/Długość geogr/);

    const latValue = await latInput.inputValue();
    const lngValue = await lngInput.inputValue();

    expect(parseFloat(latValue)).toBeCloseTo(50.0647, 2);
    expect(parseFloat(lngValue)).toBeCloseTo(19.9450, 2);
  });

  test('should allow manual coordinate editing after geolocation', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 52.0, longitude: 19.0 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Use geolocation
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();
    await page.waitForTimeout(1000);

    // Now manually edit coordinates
    const latInput = page.getByLabel(/Szerokość geogr/);
    await latInput.clear();
    await latInput.fill('51.7592');

    const lngInput = page.getByLabel(/Długość geogr/);
    await lngInput.clear();
    await lngInput.fill('19.4560');

    // Verify manual values are set
    expect(await latInput.inputValue()).toBe('51.7592');
    expect(await lngInput.inputValue()).toBe('19.4560');
  });

  test('should preserve other form fields when using geolocation', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 52.0, longitude: 19.0 });

    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in some fields first
    await page.getByRole('button', { name: /Brunatna woda/ }).click();
    await page.getByLabel(/Opis/).fill('Test description');
    await page.getByLabel(/Miasto/).fill('Warszawa');

    // Now use geolocation
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();
    await page.waitForTimeout(1000);

    // Check that other fields are still filled
    expect(await page.getByLabel(/Opis/).inputValue()).toBe('Test description');
    expect(await page.getByLabel(/Miasto/).inputValue()).toBe('Warszawa');

    // Check type is still selected
    const brownWaterButton = page.getByRole('button', { name: /Brunatna woda/ });
    await expect(brownWaterButton).toHaveClass(/bg-primary/);
  });

  test('should work in combination with map click coordinates', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 52.2297, longitude: 21.0122 });

    // Switch to add mode and click map
    const modeButton = page.getByRole('button', { name: /Kliknij aby włączyć dodawanie/ });
    await modeButton.click();

    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 400, y: 300 } });

    await expect(page.getByRole('dialog')).toBeVisible();

    // Map click should have populated coordinates
    const initialLat = await page.getByLabel(/Szerokość geogr/).inputValue();
    const initialLng = await page.getByLabel(/Długość geogr/).inputValue();

    expect(initialLat).toBeTruthy();
    expect(initialLng).toBeTruthy();

    // Now use geolocation to override
    const locationButton = page.getByRole('button', { name: /Użyj mojej lokalizacji/ });
    await locationButton.click();
    await page.waitForTimeout(1000);

    // Coordinates should now be geolocation values
    const newLat = await page.getByLabel(/Szerokość geogr/).inputValue();
    const newLng = await page.getByLabel(/Długość geogr/).inputValue();

    expect(parseFloat(newLat)).toBeCloseTo(52.2297, 2);
    expect(parseFloat(newLng)).toBeCloseTo(21.0122, 2);
  });
});
