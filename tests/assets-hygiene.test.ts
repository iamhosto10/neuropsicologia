import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : /\.(tsx?|css)$/.test(f) && out.push(p);
  }
  return out;
}
const files = walk(path.join(root, "src"));
const read = (p: string) => readFileSync(p, "utf8");

describe("recursos", () => {
  it("todo sonido referenciado en el código existe en public/sounds (antes 9 daban 404)", () => {
    const missing: string[] = [];
    for (const f of files)
      for (const m of read(f).matchAll(/["'`]\/sounds\/([\w.-]+)["'`]/g))
        if (!existsSync(path.join(root, "public/sounds", m[1]))) missing.push(`${path.relative(root, f)} -> ${m[1]}`);
    expect(missing).toEqual([]);
  });
  it("el pie de página no tiene enlaces muertos (#) y apunta a páginas que existen", () => {
    const footer = read(path.join(root, "src/components/footer/footer.tsx"));
    expect(footer).not.toMatch(/href="#"/);
    for (const r of ["privacidad", "terminos", "metodologia", "faq"]) {
      expect(footer).toContain(`href="/${r}"`);
      expect(existsSync(path.join(root, `src/app/(site)/${r}/page.tsx`))).toBe(true);
    }
  });
  it("la página de privacidad deja marcado lo pendiente de revisión legal", () => {
    expect(read(path.join(root, "src/app/(site)/privacidad/page.tsx"))).toMatch(/\[REVISAR/);
  });
});
