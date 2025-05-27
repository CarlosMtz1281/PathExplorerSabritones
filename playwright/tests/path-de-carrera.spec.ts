import { login } from "./functions.spec";
import { test, expect, Page } from '@playwright/test';

test('Check employee profile', async ({ page }) => {

    await login(page, 'EMP');

    // Click en la navbar
    await page.locator('[href="/dashboard/repo-empleados"]').click();

    page.getByText("Amit Singh");

    const targetRow = page.locator('tr', { hasText: 'Amanda Lopez' });

    const expandButton = targetRow.locator('[class="btn btn-ghost btn-sm"]');
    await expandButton.click();

    const profileButton = page.locator('tr', { hasText: 'Correo:' }).locator('button', { hasText: 'Ir a Perfil' });
    await profileButton.click();

    // Botón para abrir sub menú de trayectoria
    await page.locator('[class="btn btn-circle btn-accent btn-xs md:btn-sm text-base-100"]').click();
    await page.getByText("Ver detalles").click();

    await expect(page.getByText("Trayectoria Completa")).toBeVisible();
});

// test('Check if previous jobs dont show when employee has over 5 years in the company', async ({ page }) => {

//     await login(page);

//     // Click en la navbar
//     await page.locator('a[href="/dashboard/repo-empleados"]').click();

//     // David Brown tiene más de 6 años en la
//     page.getByText("David Brown");

//     const targetRow = page.locator('tr', { hasText: 'Amit Singh' });

//     const expandButton = targetRow.locator('[class="btn btn-ghost btn-sm"]');
//     await expandButton.click();

//     const profileButton = page.locator('tr', { hasText: 'Correo:' }).locator('button', { hasText: 'Ir a Perfil' });
//     await profileButton.click();

//     // Botón para abrir sub menú de trayectoria
//     await page.locator('[class="btn btn-circle btn-accent btn-xs md:btn-sm text-base-100"]').click();
//     await page.getByText("Ver detalles").click();

//     await expect(page.getByText("Trayectoria Completa")).toBeVisible();
// });