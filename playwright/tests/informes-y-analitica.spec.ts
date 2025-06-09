import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from '@playwright/test';

test('Información de los empleados', async ({ page }) => {
    qase.id(72);

    await login(page, 'CL');

    // Click en la navbar
    await page.locator('[href="/dashboard/repo-empleados"]').click();

    const viewport = page.viewportSize();
    if (viewport) {
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;
        await page.mouse.move(centerX, centerY);
        await page.waitForTimeout(100);
    }


    page.getByText("Abigail Parker");

    const targetRow = page.locator('tr', { hasText: 'Abigail Parker' });

    const expandButton = targetRow.locator('[class="btn btn-ghost btn-sm"]');
    await expandButton.click();

    const profileButton = page.locator('tr', { hasText: 'Correo:' }).locator('button', { hasText: 'Ir a Perfil' });
    await profileButton.click();

    // Botón para abrir sub menú de trayectoria
    await expect(page.getByText("Habilidades")).toBeVisible();
    await expect(page.getByText("Certificaciones")).toBeVisible();
    await expect(page.getByText("Posición")).toBeVisible();
});

test('Información de los empleados', async ({ page }) => {
    qase.id(72);

    await login(page, 'CL');

    // Click en la navbar
    await page.locator('[href="/dashboard/repo-empleados"]').click();

    const viewport = page.viewportSize();
    if (viewport) {
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;
        await page.mouse.move(centerX, centerY);
        await page.waitForTimeout(100);
    }


    page.getByText("Abigail Parker");

    const targetRow = page.locator('tr', { hasText: 'Abigail Parker' });

    const expandButton = targetRow.locator('[class="btn btn-ghost btn-sm"]');
    await expandButton.click();

    const profileButton = page.locator('tr', { hasText: 'Correo:' }).locator('button', { hasText: 'Ir a Perfil' });
    await profileButton.click();

    // Botón para abrir sub menú de trayectoria
    await expect(page.getByText("Habilidades")).toBeVisible();
    await expect(page.getByText("Certificaciones")).toBeVisible();
    await expect(page.getByText("Posición")).toBeVisible();
});