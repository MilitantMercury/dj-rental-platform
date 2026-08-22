import { expect, test } from "@playwright/test";

test("la pagina iniziale è disponibile e presenta il servizio", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Noleggio DJ/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Il tuo evento,\s*con il suono giusto\./ }),
  ).toBeVisible();
  await expect(page.getByText(/non equivale a una prenotazione/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Esplora il catalogo" })).toBeVisible();
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

test("il catalogo admin è protetto", async ({ page }) => {
  await page.goto("/area-riservata/catalogo");
  await expect(page).toHaveURL(/\/accesso$/);
});

test("l’anteprima catalogo owner è protetta", async ({ page }) => {
  await page.goto("/area-riservata/catalogo/anteprima/products/10000000-0000-0000-0000-000000000001");
  await expect(page).toHaveURL(/\/accesso$/);
});
test("il catalogo pubblico è visitabile senza autenticazione", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Il setup giusto");
  await expect(page.getByRole("navigation", { name: "Filtra il catalogo per categoria" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Costruisci il tuo setup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completa l’esperienza" })).toBeVisible();
});
