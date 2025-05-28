import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from '@playwright/test';

test('Profile returns the correct user data', async ({ request, page }) => {

    qase.id(46);
    
    const userId = await login(page, 'EMP');

    const response = await request.get(`http://localhost:3003/employee/user/${userId}`);
    const apiData = await response.json();

    const name = await page.locator('[class="text-3xl font-bold"]').textContent();
    const country = await page.locator('p', { hasText: apiData.Country.country_name }).textContent();
    const email = await page.locator(`text=${apiData.mail}`).textContent();
    const timezone = await page.locator(`text=Zona Horaria: ${apiData.Country.timezone}`).textContent();
    const position = await page.locator('.text-primary.text-xl').textContent();
    const level = await page.locator('.border-primary .text-2xl').textContent();

    const trimmed = (str?: string | null) => str?.trim() ?? '';

    expect(trimmed(name)).toBe(apiData.name);
    expect(trimmed(email)).toBe(apiData.mail);
    expect(trimmed(country)).toBe(apiData.Country.country_name);
    expect(trimmed(timezone)).toContain(apiData.Country.timezone);
    expect(trimmed(position)).toBe(apiData.position_name);
    expect(trimmed(level)).toBe(String(apiData.level));

});

test('Register Experience', async ({ page }) => {
    qase.id(51);

    await login(page, 'EMP');

    // Botón para abrir sub menú de trayectoria
    await page.locator('[class="btn btn-circle btn-accent btn-xs md:btn-sm text-base-100"]').click();
    await page.getByRole('button', { name: "Agregar experiencia"}).click();

    await page.getByPlaceholder("Nombre de la empresa").click();
    await page.getByPlaceholder("Nombre de la empresa").fill("PEMEX");

    await page.getByPlaceholder("Nombre del puesto").click();
    await page.getByPlaceholder("Nombre del puesto").fill("Software Engineer");

    const startDateInput = page.locator('.input.input-bordered.w-full').nth(2);
    await startDateInput.click();
    await startDateInput.fill('2004-04-04');

    const endDateInput = page.locator('.input.input-bordered.w-full').nth(3);
    await endDateInput.click();
    await endDateInput.fill('2007-04-04');

    
    await page.getByPlaceholder('Describe tus responsabilidades y logros').click();
    await page.getByPlaceholder('Describe tus responsabilidades y logros').fill("I worked for many years and was the best one of them all lol xd rofl");

    await page.getByRole('button', { name: "Guardar Experiencia"}).click();

    await expect(page.getByText('¡Experiencia guardada con éxito!')).toBeVisible();
    
});

test('Register Skill', async ({ page }) => {
    qase.id(53);

    await login(page, 'EMP');

    await page.locator('[class="btn btn-circle btn-accent btn-xs md:btn-sm ml-auto text-base-100"]').nth(1).click();

    await page.getByPlaceholder('Buscar habilidad...').click();
    await page.getByPlaceholder('Buscar habilidad...').fill("python");

    await page.getByRole('button', { name: 'Python' }).click();
    await expect(page.locator('[class="text-xs"]').getByText('Python')).toBeVisible();

    await page.getByRole('button', { name: "Agregar"}).click();
    await expect(page.locator('[class="badge badge-outline badge-primary px-8 py-3.5 text-xs"]').getByText('Python')).toBeVisible();
});