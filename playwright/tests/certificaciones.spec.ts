import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from '@playwright/test';
import path from "path";

test('Tipos de documentos permitidos (Positivo)', async ({ page }) => {
    qase.id(56);

    await login(page, "EMP");

    await page.locator('[class="btn btn-circle btn-accent"]').click();

    const nico = page.locator('[class="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"]')
    await nico.nth(8).click();

    const fileInput = page.locator('input[type="file"]');
    const filePath = path.resolve(__dirname, 'test-files/TestFile2b.pdf');

    await fileInput.setInputFiles(filePath);

    expect(page.getByRole("button").getByText("Subir")).toBeVisible();
})

test('Documentos muy pesados', async ({ page }) => {
    qase.id(96);

    await login(page, "EMP");

    await page.locator('[class="btn btn-circle btn-accent"]').click();

    const nico = page.locator('[class="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"]')
    await nico.nth(8).click();

    const fileInput = page.locator('input[type="file"]');
    const filePath = path.resolve(__dirname, 'test-files/TestFile15b.pdf');

    await fileInput.setInputFiles(filePath);

    expect(page.locator('[class="text-error"]')).toBeVisible();
})

