import { defineConfig, devices } from "@playwright/test";

// Pruebas de punta a punta que NO necesitan una cuenta ni datos reales (rutas públicas y
// protección de rutas). Las pruebas con sesión requieren credenciales de pruebas de Clerk.
const PORT = 3101;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // iPad real: viewport y pantalla táctil emulados
    { name: "ipad", use: { ...devices["iPad Pro 11"], browserName: "chromium" } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/faq`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
