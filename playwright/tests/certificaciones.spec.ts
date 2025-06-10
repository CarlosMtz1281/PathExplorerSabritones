import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from '@playwright/test';
import path from "path";

test('Tipos de documentos permitidos (Positivo)', async ({ page }) => {
    qase.id(56);

    await login(page, "EMP");

    const certCard = page.locator('[class="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"]');
    await certCard.getByText("Cisco Certified Network Associate (CCNA)").click();

    const modal = page.locator('[class="text-2xl font-bold ml-5"]');
    expect(modal.getByText("Cisco Certified Network Associate (CCNA)")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    const filePath = path.resolve(__dirname, 'test-files/TestFile2b.pdf');

    await fileInput.setInputFiles(filePath);

    await page.getByText("Subir").click();
})

test('Documentos muy pesados', async ({ page }) => {
    qase.id(96);

    await login(page, "EMP");

    await page.locator('[class="btn btn-circle btn-accent"]').click();

    const certCard = page.locator('[class="card bg-base-100 flex justify-center items-center p-4 text-center border border-primary rounded-lg hover:bg-base-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"]');
    await certCard.getByText("Cisco Certified Network Associate (CCNA)").click();

    const modal = page.locator('[class="text-2xl font-bold ml-5"]');
    expect(modal.getByText("Cisco Certified Network Associate (CCNA)")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    const filePath = path.resolve(__dirname, 'test-files/TestFile15b.pdf');

    await fileInput.setInputFiles(filePath);

    expect(page.locator('[class="text-error"]')).toBeVisible();
})

