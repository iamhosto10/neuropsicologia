import { expect, test } from "@playwright/test";

// Sin sesión, todo lo privado debe mandar al inicio de sesión DE LA APP (no a un portal externo).
test.describe("protección de rutas", () => {
  for (const path of ["/dashboard", "/dashboard/pacientes", "/hq", "/hq/store", "/select-profile", "/test", "/juegos"]) {
    test(`${path} sin sesión redirige a /sign-in`, async ({ page }) => {
      await page.goto(path, { waitUntil: "commit" });
      await page.waitForURL(/\/sign-in/, { timeout: 30_000 });
      expect(new URL(page.url()).origin).toBe(new URL(test.info().project.use.baseURL!).origin);
    });
  }

  test("/sign-in no se redirige a sí misma (sin bucles)", async ({ page }) => {
    const res = await page.goto("/sign-in");
    expect(res?.status()).toBe(200);
    expect(page.url()).toContain("/sign-in");
  });
});
