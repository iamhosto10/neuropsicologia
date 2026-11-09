import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");

// El inicio de sesión vive DENTRO de la app. Con el portal externo (*.accounts.dev) el navegador
// embebido y el servidor local entraban en bucle de redirecciones ("infinite redirect loop").
describe("inicio de sesión dentro de la app", () => {
  it("existen /sign-in y /sign-up", () => {
    expect(existsSync(path.join(root, "src/app/sign-in/[[...sign-in]]/page.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "src/app/sign-up/[[...sign-up]]/page.tsx"))).toBe(true);
  });
  it("el proxy y el proveedor apuntan a esas rutas", () => {
    expect(read("src/proxy.ts")).toMatch(/signInUrl: "\/sign-in"/);
    expect(read("src/app/layout.tsx")).toMatch(/signInUrl="\/sign-in"/);
  });
  it("/sign-in no está protegida (si no, sería un bucle)", () => {
    const list = read("src/proxy.ts").match(/createRouteMatcher\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
    expect(list).not.toMatch(/sign-(in|up)/);
  });
});
