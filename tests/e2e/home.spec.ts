import { expect, test } from "@playwright/test";

test("la pagina iniziale è disponibile e presenta il servizio", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Noleggio DJ/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Il tuo evento,\s*con il suono giusto\./ }),
  ).toBeVisible();
  await expect(page.getByText(/non equivale a una prenotazione/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Registrati" })).toBeVisible();
});

test("registrazione e accesso sono disponibili", async ({ page }) => {
  await page.goto("/registrazione");
  await expect(page.getByRole("heading", { name: "Crea il tuo account" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await page.goto("/accesso");
  await expect(page.getByRole("heading", { name: "Bentornato" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Password dimenticata?" })).toBeVisible();
});

test("l’area riservata respinge un visitatore anonimo", async ({ page }) => {
  await page.goto("/area-riservata");
  await expect(page).toHaveURL(/\/accesso$/);
  await expect(page.getByRole("heading", { name: "Bentornato" })).toBeVisible();
});
