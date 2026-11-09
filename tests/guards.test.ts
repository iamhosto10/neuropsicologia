import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { isSafeId, retryOnConflict } from "@/lib/sanity-safe";
import { createFake } from "./helpers/fake-sanity";

describe("sanity-safe", () => {
  it("isSafeId acepta ids de Sanity y rechaza comillas/rutas", () => {
    expect(isSafeId("9dd89a7a-e7ea-46cf-9ef4-1000c0af6193")).toBe(true);
    expect(isSafeId("activity-busqueda-del-tesoro")).toBe(true);
    for (const bad of ['a"b', "a b", "", "x".repeat(200), 'x"] || true', 123, null]) expect(isSafeId(bad as any)).toBe(false);
  });
  it("retryOnConflict reintenta solo en 409 y respeta el límite", async () => {
    let n = 0;
    const r = await retryOnConflict(async () => {
      if (n++ < 2) throw Object.assign(new Error("c"), { statusCode: 409 });
      return "ok";
    });
    expect(r).toBe("ok");
    await expect(retryOnConflict(async () => { throw Object.assign(new Error("x"), { statusCode: 500 }); })).rejects.toThrow("x");
    let calls = 0;
    await expect(retryOnConflict(async () => { calls++; throw Object.assign(new Error("c"), { statusCode: 409 }); }, 3)).rejects.toThrow();
    expect(calls).toBe(3);
  });
});

describe("el cliente falso modela la regla real de Sanity", () => {
  it("dos append en el mismo patch pierden el primero (por eso está prohibido)", async () => {
    const s = createFake().seed({ _id: "d", a: [], b: [] });
    await s.patch("d").append("a", [1]).append("b", [2]).commit();
    expect(s.docs.d.a).toEqual([]);
    expect(s.docs.d.b).toEqual([2]);
  });
});

// Guardia estática: ninguna server action puede encadenar dos .append()/.insert() en la misma sentencia.
describe("regla de código: un append por patch", () => {
  const dir = path.resolve(__dirname, "../src/app/actions");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    it(`${file} no encadena dos append en un patch`, () => {
      const src = readFileSync(path.join(dir, file), "utf8").replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const statements = src.split(/;\s*\n/);
      const bad = statements.filter((st) => (st.match(/\.(append|insert)\(/g) ?? []).length > 1);
      expect(bad, bad.join("\n---\n")).toEqual([]);
    });
  }
});
