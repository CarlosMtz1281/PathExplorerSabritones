import { qase } from "playwright-qase-reporter";
import { login } from "./functions";
import { test, expect, Page } from "@playwright/test";

test("Creación de proyectos", async ({ page }) => {
  qase.id(59);

  await login(page, "DL");

  // Click en la nav
  await page.locator('[href="/dashboard/crea-projects"]').click();

  await page.getByPlaceholder("Nombre del proyecto").click();
  await page
    .getByPlaceholder("Nombre del proyecto")
    .fill("Proyecto PathExplorer");

  await page.getByPlaceholder("Empresa").click();
  await page.getByPlaceholder("Empresa").fill("BBVA");

  // País (Región)
  await page
    .locator("select.select-bordered")
    .first()
    .selectOption({ label: "Reino Unido" });

  const startDateInput = page.locator(
    '[class="input input-bordered w-full mt-2 pl-6 pr-10 py-5"]'
  );
  await startDateInput.click();
  await startDateInput.fill("2025-06-30");

  const endDateInput = page
    .locator('[class="input input-bordered w-full mt-2 px-6 p-5"]')
    .nth(2);
  await endDateInput.click();
  await endDateInput.fill("2026-06-30");

  await page.getByPlaceholder("Escribe una descripción del proyecto").click();
  await page
    .getByPlaceholder("Escribe una descripción del proyecto")
    .fill(
      "En este proyecto crearemos una plataforma en la que los empleados..."
    );

  // Agregar primer puesto
  await page.getByRole("button", { name: "Agregar Puesto" }).click();

  let nombreDelPuesto = page
    .locator('[class="input input-bordered w-full"]')
    .nth(0);
  await nombreDelPuesto.click();
  await nombreDelPuesto.fill("Front-End Engineer");

  // Capability
  await page
    .locator("select.select-bordered")
    .nth(1)
    .selectOption({ label: "Diseño de UI y UX" });

  let cantidad = page.locator('[class="input input-bordered w-full"]').nth(1);
  await cantidad.click();
  await cantidad.fill("3");

  // Habilidades (React, Communication)
  await page
    .locator("select.select-bordered")
    .nth(2)
    .selectOption({ label: "React" });
  await page
    .locator("select.select-bordered")
    .nth(2)
    .selectOption({ label: "Comunicación" });

  // Certificaciones (AWS, Google)
  await page
    .locator("select.select-bordered")
    .nth(3)
    .selectOption({ label: "AWS Certified Developer - Associate" });
  await page
    .locator("select.select-bordered")
    .nth(3)
    .selectOption({ label: "Google Professional Data Engineer" });

  await page.getByRole("button", { name: "Agregar" }).nth(1).click();

  await expect(page.getByText("Front-End Engineer")).toBeVisible();

  // Agregar segundo puesto
  await page.getByRole("button", { name: "Agregar Puesto" }).click();

  nombreDelPuesto = page
    .locator('[class="input input-bordered w-full"]')
    .nth(0);
  await nombreDelPuesto.click();
  await nombreDelPuesto.fill("Back-End Engineer");

  // Capability
  await page
    .locator("select.select-bordered")
    .nth(1)
    .selectOption({ label: "Arquitectura en la nube" });

  cantidad = page.locator('[class="input input-bordered w-full"]').nth(1);
  await cantidad.click();
  await cantidad.fill("3");

  // Habilidades (Node.js, SQL)
  await page
    .locator("select.select-bordered")
    .nth(2)
    .selectOption({ label: "Node.js" });
  await page
    .locator("select.select-bordered")
    .nth(2)
    .selectOption({ label: "SQL" });

  // Certificaciones (Oracle, Google)
  await page
    .locator("select.select-bordered")
    .nth(3)
    .selectOption({ label: "Oracle Database SQL Certified Associate" });
  await page
    .locator("select.select-bordered")
    .nth(3)
    .selectOption({ label: "Google Associate Cloud Engineer" });

  await page.getByRole("button", { name: "Agregar" }).nth(1).click();

  await expect(page.getByText("Back-End Engineer")).toBeVisible();

  await page.getByRole("button", { name: "Crear proyecto" }).click();

  await page.locator('[href="/dashboard/dl-dashboard"]').click();

  await expect(page.getByText("Proyecto PathExplorer")).toBeVisible();
});

test("Error Handling de Creación de proyectos", async ({ page }) => {
  qase.id(61);

  await login(page, "DL");

  // Click en la nav
  await page.locator('[href="/dashboard/crea-projects"]').click();

  await page.getByPlaceholder("Nombre del proyecto").click();
  await page.getByPlaceholder("Nombre del proyecto").fill("Not Found");

  await page.getByRole("button", { name: "Crear proyecto" }).click();

  await page.locator('[href="/dashboard/dl-dashboard"]').click();

  await expect(page.getByText("Not Found")).not.toBeVisible();
});

test('Postulación del empleado a proyecto', async ({ page }) => {
  qase.id(77);

  await login(page, 'CL');

  await page.locator('[href="/dashboard/repo-projects"]').click();

  // Quitar el hover de la nav
  const viewport = page.viewportSize();
  if (viewport) {
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      await page.mouse.move(centerX, centerY);
      await page.waitForTimeout(300);
  }

  const project = page.locator('tr', { hasText: 'App de Turismo Local' });
  await project.locator('[class="dropdown-button ml-3 hover:cursor-pointer"]').click();
  await project.locator('[class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-focus transition-colors"]').click();

  await page.locator('[class="collapse collapse-arrow bg-base-200 rounded-lg shadow-sm border border-base-300"]').nth(0).click()
  await page.locator('[class="btn btn-primary btn-sm"]').nth(0).click();

 
})

test('Visualizacion de proyectos', async ({ page }) => {
  qase.id(112);

  await login(page, 'DL');

  await page.locator('[href="/dashboard/dl-dashboard"]').click();

  const viewport = page.viewportSize();
  if (viewport) {
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      await page.mouse.move(centerX, centerY);
      await page.waitForTimeout(300);
  }

  expect(page.getByText("Proyectos en Curso")).toBeVisible;

})
