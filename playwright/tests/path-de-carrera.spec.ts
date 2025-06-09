import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from '@playwright/test';

test('Check employee profile', async ({ page }) => {
    qase.id(16);

    await login(page, 'EMP');

    // Click en la navbar
    await page.locator('[href="/dashboard/repo-empleados"]').click();

    const viewport = page.viewportSize();
    if (viewport) {
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;
        await page.mouse.move(centerX, centerY);
        await page.waitForTimeout(300);
    }

    page.getByText("Abigail Parker");

    const targetRow = page.locator('tr', { hasText: 'Abigail Parker' });

    const expandButton = targetRow.locator('[class="btn btn-ghost btn-sm"]');
    await expandButton.click();

    const profileButton = page.locator('tr', { hasText: 'Correo:' }).locator('button', { hasText: 'Ir a Perfil' });
    await profileButton.click();

    // Botón para abrir sub menú de trayectoria
    await page.locator('[class="btn btn-circle btn-accent btn-xs md:btn-sm text-base-100"]').click();
    await page.getByText("Ver detalles").click();

    await expect(page.getByText("Trayectoria Completa")).toBeVisible();
});

test('Check People Lead Dashboard', async ({ page}) => {
    qase.id(100);

    await login(page, 'PL');

    // Click en la navbar
    await page.locator('[href="/dashboard/pl-dashboard"]').click();

    // Quitar el hover de la nav
    const viewport = page.viewportSize();
    if (viewport) {
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;
        await page.mouse.move(centerX, centerY);
        await page.waitForTimeout(300);
    }

    const title = page.locator('[class="flex w-full items-center bg-base-100 p-5 text-4xl font-bold rounded-md border border-base-300 mb-6 text-secondary"]');
    expect(title.getByText("Resumen de Cargos")).toBeVisible;

    const counselees = page.locator('[class="flex w-full items-center bg-base-100 p-5 text-3xl font-bold rounded-md border border-base-300 mb-8 mt-2 text-secondary"]');
    expect(counselees.getByText("Tus Counselees")).toBeVisible;

})

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