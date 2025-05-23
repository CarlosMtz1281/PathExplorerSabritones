import { test, expect, Page } from '@playwright/test';

type UserType = 'DL' | 'CL' | 'PL' | 'EMP';

const credentials: Record<UserType, { email: string; password: string }> = {
  DL: { email: 'james.wilson@accenture.com', password: 'wilson123' },
  CL: { email: 'michael.brown@accenture.com', password: 'brown123' },
  PL: { email: 'christopher.taylor@accenture.com', password: 'taylor123' },
  EMP: { email: 'william.green@accenture.com', password: 'green123' },
};

async function login(page: Page, type: UserType): Promise<number> {
  const { email, password } = credentials[type];

  await page.goto('http://localhost:3000/login');

  // Finds log in button on title-page
  let loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor();
  await loginButton.click();

  // Fills inputs with data
  await page.getByPlaceholder('email@accenture.com').fill(email);
  await page.getByPlaceholder('********').fill(password);

  // Clicks for login button
  loginButton = page.getByRole('button', { name: 'Iniciar Sesión'});
  await loginButton.waitFor();
  await loginButton.click();

  await expect(page).toHaveURL(/dashboard\/profile\/\d+$/);

  const url = page.url();
  return parseInt(url.split('/').pop()!);
}

export { login }

