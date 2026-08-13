import { expect, test } from "@playwright/test";

test("la pagina iniziale è disponibile e presenta il servizio", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Noleggio DJ/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Il tuo evento,\s*con il suono giusto\./ }),
  ).toBeVisible();
  await expect(page.getByText(/non equivale a una prenotazione/i)).toBeVisible();
});
