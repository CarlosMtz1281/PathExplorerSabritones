import { test, expect, Page, request } from '@playwright/test';


type UserType = 'DL' | 'CL' | 'PL' | 'EMP' | 'ADM';

const credentials: Record<UserType, { email: string; password: string }> = {
  DL: { email: 'james.wilson@accenture.com', password: 'wilson123' },
  CL: { email: 'michael.brown@accenture.com', password: 'brown123' },
  PL: { email: 'christopher.taylor@accenture.com', password: 'taylor123' },
  EMP: { email: 'william.green@accenture.com', password: 'green123' },
  ADM: { email: 'admin1@accenture.com', password: 'admin123'},
};

async function login(page: Page, type: UserType): Promise<number> {
  const { email, password } = credentials[type];
  
  await page.goto('http://localhost:3000/login');

  let loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor();
  await loginButton.click();

  await page.getByPlaceholder('email@accenture.com').fill(email);
  await page.getByPlaceholder('********').fill(password);

  loginButton = page.getByRole('button', { name: 'Iniciar Sesión'});
  await loginButton.waitFor();
  await loginButton.click();

  await expect(page).toHaveURL(/dashboard\/profile$/);

  const apiContext = await request.newContext({ baseURL: 'http://localhost:3003' });

  const loginResponse = await apiContext.post('/general/login', {
    data: { mail: email, password },
  });

  if (!loginResponse.ok()) {
    throw new Error(`Login API failed: ${loginResponse.status()}`);
  }

  const json = await loginResponse.json();

  if (!json.userId) {
    throw new Error('userId not found in login response');
  }

  return json.userId;
}

export { login }

