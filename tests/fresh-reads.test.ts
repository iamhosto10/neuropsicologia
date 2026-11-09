import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : /\.(tsx?|ts)$/.test(f) && out.push(p);
  }
  return out;
}

// La caché CDN de Sanity puede devolver datos viejos justo después de guardar (se vio un cadete
// borrado que seguía listado). Todo lo que lea datos de un niño o su progreso debe ir sin CDN.
describe("lecturas de progreso sin caché CDN", () => {
  it("ninguna consulta de kidProfile/dailySession usa client.fetch directo (con CDN)", () => {
    const offenders: string[] = [];
    for (const f of walk(path.join(root, "src/app"))) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/\bclient\.fetch\(/g)) {
        const rest = src.slice(m.index!);
        const window = rest.slice(0, Math.max(rest.indexOf(");"), 1) + 2); // solo esta llamada
        if (/kidProfile|dailySession/.test(window)) offenders.push(`${path.relative(root, f)}: ${window.slice(0, 80).replace(/\n/g, " ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });
  it("leer-y-escribir el temario de un curso parte de datos frescos", () => {
    expect(readFileSync(path.join(root, "src/app/actions/builder.actions.ts"), "utf8")).toMatch(/currentCourse = await client\.withConfig\(\{ useCdn: false \}\)/);
  });
});
