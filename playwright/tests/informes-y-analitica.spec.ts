import { login } from "./functions.spec";
import { test, expect, Page } from '@playwright/test';

test('Employee correct information', async ({ request, page }) => {

    await login(page);

    // Click en la nav
    await page.locator('[href="/dashboard/repo-projects"]').click();

    const targetRow = page.locator('tr', { hasText: 'Proyecto PathExplorer' });
    await targetRow.click();

    // Entramos al projecto
    const asignButton = targetRow.getByRole('button', { name: "Asignar"});
    await asignButton.click();


});