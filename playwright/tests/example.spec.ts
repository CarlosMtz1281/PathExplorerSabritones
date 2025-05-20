import { test, expect } from '@playwright/test';

test('successful login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  // Finds log in button on title-page
  let loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor();
  await loginButton.click();

  // Fills inputs with data
  await page.getByPlaceholder('email@accenture.com').fill('john.doe@example.com');
  await page.getByPlaceholder('********').fill('password123');

  // Clicks for login button
  loginButton = page.getByRole('button', { name: 'Iniciar Sesión'});
  await loginButton.waitFor();
  await loginButton.click();

  await expect(page).toHaveURL('http://localhost:3000/dashboard/profile');

});


