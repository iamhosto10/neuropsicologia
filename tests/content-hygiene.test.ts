import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parseReward, slugify } from "@/lib/content-roles";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");
function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : /page\.tsx$/.test(f) && out.push(p);
  }
  return out;
}

describe("slug y recompensas de bloques", () => {
  it("slugify quita tildes y nunca queda vacío", () => {
    expect(slugify("Lección 1: Atención y Memoria")).toBe("leccion-1-atencion-y-memoria");
    expect(slugify("Ñandú ¡Corre!")).toBe("nandu-corre");
    expect(slugify("🚀🚀")).toBe("contenido");
    expect(slugify("")).toBe("contenido");
    expect(slugify("a".repeat(300)).length).toBeLessThanOrEqual(80);
  });
  it("parseReward: 0 es válido, tope 100, basura usa el valor por defecto", () => {
    expect(parseReward("0", 10)).toBe(0);
    expect(parseReward(0, 10)).toBe(0);
    expect(parseReward("25", 10)).toBe(25);
    expect(parseReward("99999", 10)).toBe(100);
    expect(parseReward("-5", 10)).toBe(0);
    expect(parseReward("abc", 15)).toBe(15);
    expect(parseReward(undefined, 15)).toBe(15);
  });
});

describe("higiene del proyecto", () => {
  it("usa proxy.ts (Next 16) y no el middleware.ts deprecado", () => {
    expect(existsSync(path.join(root, "src/proxy.ts"))).toBe(true);
    expect(existsSync(path.join(root, "src/middleware.ts"))).toBe(false);
  });
  it("no se imprime telemetría ni datos del niño en consola (juegos, HQ, ficha)", () => {
    for (const f of [...readdirSync(path.join(root, "src/components/games")).map((x) => `src/components/games/${x}`), "src/app/(kids-hub)/hq/page.tsx", "src/app/(login)/dashboard/kid/[id]/page.tsx"])
      expect(read(f), f).not.toMatch(/console\.log/);
  });
  it("las lecciones no arrastran la configuración del Studio de Sanity al bundle público", () => {
    expect(read("src/components/lesson-detail/inline-game-wrapper.tsx")).not.toMatch(/sanity\.config/);
  });
  it("el límite de cuerpo de las server actions ya no es 10 MB", () => {
    expect(read("next.config.ts")).not.toMatch(/10mb/);
  });
  it("todas las páginas del panel y de actividades tienen título propio", () => {
    const need = [
      "src/app/(login)/dashboard/kid/[id]/page.tsx", "src/app/(login)/dashboard/kid/[id]/academico/page.tsx",
      "src/app/(login)/dashboard/kid/[id]/assign/page.tsx", "src/app/(login)/dashboard/kid/[id]/assign/planificador/page.tsx",
      "src/app/(login)/dashboard/kid/[id]/reporte/[gameType]/page.tsx", "src/app/(site)/actividades/[slug]/page.tsx",
    ];
    for (const f of need) expect(read(f), f).toMatch(/metadata|generateMetadata/);
    expect(read("src/app/(login)/dashboard/add-cadet/layout.tsx")).toMatch(/metadata/);
  });
  it("la barra superior no usa datos falsos ni la campana decorativa", () => {
    const t = read("src/components/dashboard-layout/topbar.tsx");
    expect(t).toMatch(/useUser/);
    expect(t).not.toMatch(/<Bell /);
  });
  it("la landing ya no describe mal los juegos ni promete 'terapia' o 'evidencia'", () => {
    const all = ["tools-section", "landing-hero", "social-proof", "dual-approach"].map((f) => read(`src/components/landing/${f}.tsx`)).join("\n");
    expect(all).not.toMatch(/secuencias de luces y sonidos|Dispara a los asteroides|Basado en Evidencia|Cero frustración|Terapia neuropsicológica/);
    expect(all).toMatch(/Atención Sostenida/);
  });
  it("el reproductor de audio tiene respaldo nativo si falla la onda (CORS)", () => {
    const a = read("src/components/lesson-detail/audio-player-block.tsx");
    expect(a).toMatch(/wavesurfer\.on\("error"/);
    expect(a).toMatch(/<audio controls/);
  });
});
