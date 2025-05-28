import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from '@playwright/test';

test('Create a proyect', async ({ page }) => {
    qase.id(59);
    
    await login(page, 'DL');

    // Click en la nav
    await page.locator('[href="/dashboard/crea-projects"]').click();

    await page.getByPlaceholder("Nombre del proyecto").click();
    await page.getByPlaceholder("Nombre del proyecto").fill("Proyecto PathExplorer");

    await page.getByPlaceholder("Empresa").click();
    await page.getByPlaceholder("Empresa").fill("BBVA");

    // País (Región)
    await page.locator('select.select-bordered').first().selectOption({ label: 'Reino Unido' });

    const startDateInput = page.locator('[class="input input-bordered w-full mt-2 pl-6 pr-10 py-5"]');
    await startDateInput.click();
    await startDateInput.fill("2025-06-30");

    const endDateInput = page.locator('[class="input input-bordered w-full mt-2 px-6 p-5"]').nth(2);
    await endDateInput.click();
    await endDateInput.fill("2026-06-30");

    await page.getByPlaceholder("Escribe una descripción del proyecto").click();
    await page.getByPlaceholder("Escribe una descripción del proyecto").fill("En este proyecto crearemos una plataforma en la que los empleados...");

    // Agregar primer puesto
    await page.getByRole('button', { name: "Agregar Puesto" }).click();

    let nombreDelPuesto = page.locator('[class="input input-bordered w-full"]').nth(0);
    await nombreDelPuesto.click();
    await nombreDelPuesto.fill("Front-End Engineer");

    // Capability
    await page.locator('select.select-bordered').nth(1).selectOption({ label: 'Diseño de UI y UX'});

    let cantidad = page.locator('[class="input input-bordered w-full"]').nth(1);
    await cantidad.click();
    await cantidad.fill("3");

    // Habilidades (React, Communication)
    await page.locator('select.select-bordered').nth(2).selectOption({ label: 'React' });
    await page.locator('select.select-bordered').nth(2).selectOption({ label: 'Comunicación' });

    // Certificaciones (AWS, Google)
    await page.locator('select.select-bordered').nth(3).selectOption({ label: 'AWS Certified Developer - Associate' });
    await page.locator('select.select-bordered').nth(3).selectOption({ label: 'Google Professional Data Engineer' });

    await page.getByRole('button', { name: "Agregar"}).nth(1).click();

    await expect(page.getByText("Front-End Engineer")).toBeVisible();

    // Agregar segundo puesto
    await page.getByRole('button', { name: "Agregar Puesto" }).click();

    nombreDelPuesto = page.locator('[class="input input-bordered w-full"]').nth(0);
    await nombreDelPuesto.click();
    await nombreDelPuesto.fill("Back-End Engineer");

    // Capability
    await page.locator('select.select-bordered').nth(1).selectOption({ label: 'Arquitectura en la nube'});

    cantidad = page.locator('[class="input input-bordered w-full"]').nth(1);
    await cantidad.click();
    await cantidad.fill("3");

    // Habilidades (Node.js, SQL)
    await page.locator('select.select-bordered').nth(2).selectOption({ label: 'Node.js' });
    await page.locator('select.select-bordered').nth(2).selectOption({ label: 'SQL' });

    // Certificaciones (Oracle, Google)
    await page.locator('select.select-bordered').nth(3).selectOption({ label: 'Oracle Database SQL Certified Associate' });
    await page.locator('select.select-bordered').nth(3).selectOption({ label: 'Google Associate Cloud Engineer' });

    await page.getByRole('button', { name: "Agregar"}).nth(1).click();

    await expect(page.getByText("Back-End Engineer")).toBeVisible();

    await page.getByRole('button', { name: "Crear proyecto"}).click();

    await page.locator('[href="/dashboard/repo-projects"]').click();

    await expect(page.getByText("Proyecto PathExplorer")).toBeVisible();

});

test('Create a proyect wrong', async ({ page }) => {
    qase.id(61);

    await login(page, 'DL');

    // Click en la nav
    await page.locator('[href="/dashboard/crea-projects"]').click();

    await page.getByPlaceholder("Nombre del proyecto").click();
    await page.getByPlaceholder("Nombre del proyecto").fill("Not Found");

    await page.getByRole('button', { name: "Crear proyecto"}).click();

    await page.locator('[href="/dashboard/repo-projects"]').click();

    await expect(page.getByText("Not Found")).not.toBeVisible();

});


test('Proyect information returns de correct data', async ({ request, page }) => {
    qase.id(66);

    await login(page, 'CL');

    // Click en la nav
    await page.locator('[href="/dashboard/repo-projects"]').click();

    const targetRow = page.locator('tr', { hasText: 'Proyecto PathExplorer' });
    await targetRow.click();

    //Entramos al projecto
    const asignButton = targetRow.getByRole('button', { name: "Postular"});
    await asignButton.click();

    // Sacamos el id del proyecto
    await page.waitForURL('**/dashboard/project-details/**');
    const url = page.url();
    const projectId = url.split('/').pop();
    
    const response = await request.get(`http://localhost:3003/project/getProjectById/${projectId}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Comprobar campos en la UI
    const start = data.start_date;
    const end = data.end_date || "En progreso";
    const capability = data.details.capability;
    const company = data.details.company;
    const country = data.details.country;
    const desc = data.description;

    await expect(page.locator('p:has-text("Fechas:")')).toHaveText(new RegExp(`Fechas:\\s+${start} - ${end}`));
    await expect(page.locator('p:has-text("Delivery Lead:")')).toHaveText(new RegExp(`Delivery Lead:\\s+${capability}`));
    await expect(page.locator('p:has-text("Empresa:")')).toHaveText(new RegExp(`Empresa:\\s+${company}`));
    await expect(page.locator('p:has-text("País:")')).toHaveText(new RegExp(`País:\\s+${country}`));
    
    if (desc) {
        await expect(page.locator('p:has-text("Descripción:")').nth(0)).toHaveText(new RegExp(`Descripción:\\s+${desc}`));
    }
});
