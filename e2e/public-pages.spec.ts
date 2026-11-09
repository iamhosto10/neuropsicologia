import { expect, test } from "@playwright/test";

test.describe("páginas públicas y legales", () => {
  for (const [path, h1] of [
    ["/privacidad", /Tratamiento de Datos Personales/],
    ["/terminos", /Términos de Servicio/],
    ["/metodologia", /Metodología Clínica/],
    ["/faq", /Preguntas Frecuentes/],
  ] as const) {
    test(`${path} carga con su título`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1").first()).toHaveText(h1);
    });
  }

  test("el borrador legal avisa que falta revisión", async ({ page }) => {
    await page.goto("/privacidad");
    await expect(page.getByRole("note")).toContainText("pendiente de revisión legal");
  });

  test("la metodología aclara que no es diagnóstico", async ({ page }) => {
    await page.goto("/metodologia");
    await expect(page.locator("main")).toContainText("no constituyen un diagnóstico");
  });

  test("el pie de página enlaza a las páginas legales (sin enlaces muertos)", async ({ page }) => {
    await page.goto("/faq");
    const footer = page.locator("footer");
    for (const href of ["/privacidad", "/terminos", "/metodologia", "/faq"]) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
    await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  });

  test("sin desbordamiento horizontal (también en iPad)", async ({ page }) => {
    await page.goto("/faq");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
