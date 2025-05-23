import { login } from "./functions.spec";
import { test, expect, Page } from '@playwright/test';

test('GET getProjectById/:projectId and validate UI render', async ({ request, page }) => {

    await login(page);

    // Click en la nav
    await page.locator('[href="/dashboard/repo-projects"]').click();

    const targetRow = page.locator('tr', { hasText: 'Proyecto PathExplorer' });
    await targetRow.click();

    //Entramos al projecto
    const asignButton = targetRow.getByRole('button', { name: "Asignar"});
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
