import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (p: string) => readFileSync(path.resolve(__dirname, "..", p), "utf8");

describe("páginas del panel", () => {
  const src = read("src/app/(login)/dashboard/pacientes/page.tsx");
  it("Pacientes no lee de la caché CDN (mostraba cadetes ya borrados)", () => {
    expect(src).toMatch(/withConfig\(\{ useCdn: false \}\)/);
  });
  it("Pacientes consulta las sesiones por el campo real kidProfile (no kidReference)", () => {
    expect(src).not.toMatch(/kidReference/);
    expect(src).toMatch(/kidProfile\._ref == \^\._id/);
  });
});
