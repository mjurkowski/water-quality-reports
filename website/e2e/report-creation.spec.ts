import { test, expect } from '@playwright/test';

test.describe('Report Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application (using real API)
    await page.goto('/');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should open report modal via FAB button', async ({ page }) => {
    // Click on FAB button
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    // Check modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Zgłoś problem z wodą')).toBeVisible();
  });

  test('should open report modal via map click in add mode', async ({ page }) => {
    // Switch to add mode
    const modeButton = page.getByRole('button', { name: /Kliknij aby włączyć dodawanie/ });
    await modeButton.click();

    // Wait for mode to change
    await expect(page.getByRole('button', { name: /Tryb dodawania aktywny/ })).toBeVisible();

    // Scroll to map section
    await page.locator('#map').scrollIntoViewIfNeeded();

    // Click on map
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 300, y: 300 } });

    // Check modal is open and fully visible (not hidden behind map)
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Zgłoś problem z wodą')).toBeVisible();

    // Verify modal content is accessible and visible
    await expect(page.getByLabel(/Typ problemu/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Brunatna woda/ })).toBeVisible();
  });

  test('should close modal with X button', async ({ page }) => {
    // Open modal via FAB
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    // Wait for modal
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click X button to close
    const closeButton = page.getByRole('dialog').locator('button[class*="absolute"][class*="right-4"]').first();
    await closeButton.click();

    // Check modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display all form fields', async ({ page }) => {
    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Check for all form fields
    await expect(page.getByText('Typ problemu')).toBeVisible();
    await expect(page.getByLabel(/Opis/)).toBeVisible();
    await expect(page.getByLabel(/Szerokość geogr/)).toBeVisible();
    await expect(page.getByLabel(/Długość geogr/)).toBeVisible();
    await expect(page.getByLabel(/Adres/)).toBeVisible();
    await expect(page.getByLabel(/Miasto/)).toBeVisible();
    await expect(page.getByLabel(/Email kontaktowy/)).toBeVisible();

    // Check for consent checkbox
    await expect(page.getByText(/Wyrażam zgodę na przetwarzanie/)).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /Wyślij zgłoszenie/ })).toBeVisible();
  });

  test('should select report types', async ({ page }) => {
    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Click on "Brunatna woda" type
    const brownWaterButton = page.getByRole('button', { name: /Brunatna woda/ });
    await brownWaterButton.click();

    // Check button is selected (has primary background)
    await expect(brownWaterButton).toHaveClass(/bg-primary/);

    // Click on "Nieprzyjemny zapach" type
    const badSmellButton = page.getByRole('button', { name: /Nieprzyjemny zapach/ });
    await badSmellButton.click();

    // Check both are selected
    await expect(brownWaterButton).toHaveClass(/bg-primary/);
    await expect(badSmellButton).toHaveClass(/bg-primary/);

    // Deselect one
    await brownWaterButton.click();

    // Check it's deselected
    await expect(brownWaterButton).not.toHaveClass(/bg-primary/);
    await expect(badSmellButton).toHaveClass(/bg-primary/);
  });

  test('should enforce "Brak wody" exclusivity rule', async ({ page }) => {
    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Select "Brunatna woda"
    const brownWaterButton = page.getByRole('button', { name: /Brunatna woda/ });
    await brownWaterButton.click();
    await expect(brownWaterButton).toHaveClass(/bg-primary/);

    // Select "Brak wody" - should deselect others
    const noWaterButton = page.getByRole('button', { name: /Brak wody/ });
    await noWaterButton.click();

    // Check only "Brak wody" is selected
    await expect(noWaterButton).toHaveClass(/bg-primary/);
    await expect(brownWaterButton).not.toHaveClass(/bg-primary/);

    // Try to select another type - should deselect "Brak wody"
    await brownWaterButton.click();
    await expect(brownWaterButton).toHaveClass(/bg-primary/);
    await expect(noWaterButton).not.toHaveClass(/bg-primary/);
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /Wyślij zgłoszenie/ });
    await submitButton.click();

    // Check validation errors appear
    await expect(page.getByText(/Wybierz przynajmniej jeden typ problemu/)).toBeVisible();
    await expect(page.getByText(/Musisz wyrazić zgodę na przetwarzanie danych/)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in required fields first
    await page.getByRole('button', { name: /Brunatna woda/ }).click();
    await page.getByLabel(/Miasto/).fill('Warszawa');
    await page.getByRole('checkbox').check();

    // Fill in email with invalid format
    const emailInput = page.getByLabel(/Email kontaktowy/);
    await emailInput.fill('invalid-email');

    // Blur the input to trigger validation
    await emailInput.blur();

    // Wait a moment for validation
    await page.waitForTimeout(500);

    // Try to submit
    await page.getByRole('button', { name: /Wyślij zgłoszenie/ }).click();

    // Check email validation error appears
    await expect(page.getByText(/Nieprawidlowy email/)).toBeVisible({ timeout: 3000 });
  });

  test('should fill and submit form successfully', async ({ page, context }) => {
    // Open modal
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in form
    await page.getByRole('button', { name: /Brunatna woda/ }).click();
    await page.getByLabel(/Opis/).fill('Test description of brown water issue');
    await page.getByLabel(/Szerokość geogr/).fill('52.2297');
    await page.getByLabel(/Długość geogr/).fill('21.0122');
    await page.getByLabel(/Adres/).fill('ul. Testowa 1');
    await page.getByLabel(/Miasto/).fill('Warszawa');
    await page.getByLabel(/Email kontaktowy/).fill('test@example.com');

    // Check consent
    await page.getByRole('checkbox').check();

    // Submit form
    await page.getByRole('button', { name: /Wyślij zgłoszenie/ }).click();

    // Wait for success message
    await expect(page.getByText('Dziękujemy za zgłoszenie!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Twoje zgłoszenie zostało przyjęte/)).toBeVisible();
  });

  test('should show success message after submission', async ({ page }) => {
    // Open modal and fill form quickly
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await page.getByRole('button', { name: /Brunatna woda/ }).click();
    await page.getByLabel(/Miasto/).fill('Warszawa');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /Wyślij zgłoszenie/ }).click();

    // Check success message
    await expect(page.getByText('Dziękujemy za zgłoszenie!')).toBeVisible({ timeout: 5000 });

    // Check for close button
    await expect(page.getByRole('button', { name: /Zamknij/ })).toBeVisible();
  });

  test('should populate coordinates when clicking map in add mode', async ({ page }) => {
    // Switch to add mode
    const modeButton = page.getByRole('button', { name: /Kliknij aby włączyć dodawanie/ });
    await modeButton.click();

    // Click on map at specific position
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 400, y: 300 } });

    // Check modal opened
    await expect(page.getByRole('dialog')).toBeVisible();

    // Check that coordinates are filled (they should be non-default values)
    const latInput = page.getByLabel(/Szerokość geogr/);
    const lngInput = page.getByLabel(/Długość geogr/);

    const latValue = await latInput.inputValue();
    const lngValue = await lngInput.inputValue();

    // Coordinates should be present
    expect(latValue).toBeTruthy();
    expect(lngValue).toBeTruthy();
  });

  test('should display modal above map when clicking in add mode', async ({ page }) => {
    // Scroll to map section
    await page.locator('#map').scrollIntoViewIfNeeded();

    // Switch to add mode
    const modeButton = page.getByRole('button', { name: /Kliknij aby włączyć dodawanie/ });
    await modeButton.click();

    // Confirm mode changed
    await expect(page.getByRole('button', { name: /Tryb dodawania aktywny/ })).toBeVisible();

    // Click map to open modal
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 400, y: 300 } });

    // Verify modal is visible and NOT hidden behind map
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Check that form elements are clickable (not behind map)
    const brownWaterButton = page.getByRole('button', { name: /Brunatna woda/ });
    await expect(brownWaterButton).toBeVisible();

    // Try to click the button to ensure it's not blocked by map
    await brownWaterButton.click();

    // Verify button was clicked (should have selected class)
    await expect(brownWaterButton).toHaveClass(/bg-primary/);

    // Check other form elements are accessible
    await expect(page.getByLabel(/Miasto/)).toBeVisible();
    await expect(page.getByLabel(/Opis/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Wyślij zgłoszenie/ })).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock API to return error for this test only
    await page.route('**/api/reports', async (route) => {
      if (route.request().method() === 'POST') {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    // Open modal and fill form
    const fab = page.locator('button[class*="fixed"][class*="bottom-6"][class*="right-6"]');
    await fab.click();

    await page.getByRole('button', { name: /Brunatna woda/ }).click();
    await page.getByLabel(/Miasto/).fill('Warszawa');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /Wyślij zgłoszenie/ }).click();

    // Form should still be visible (not showing success message)
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /Wyślij zgłoszenie/ })).toBeVisible();
  });
});
