import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { readSoundPref, writeSoundPref } from "@/hooks/useSoundPreference";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");
const games = readdirSync(path.join(root, "src/components/games")).filter((f) => f.endsWith("-game.tsx"));

describe("preferencia de sonido compartida", () => {
  const mem = () => {
    const m: Record<string, string> = {};
    return { getItem: (k: string) => m[k] ?? null, setItem: (k: string, v: string) => void (m[k] = v) };
  };
  it("por defecto está activado, y se recuerda al silenciar", () => {
    const s = mem();
    expect(readSoundPref(s)).toBe(true);
    writeSoundPref(s, false);
    expect(readSoundPref(s)).toBe(false);
    writeSoundPref(s, true);
    expect(readSoundPref(s)).toBe(true);
  });
  it("tolera almacenamiento bloqueado o ausente", () => {
    expect(readSoundPref(undefined)).toBe(true);
    expect(readSoundPref({ getItem: () => { throw new Error("blocked"); } })).toBe(true);
    expect(() => writeSoundPref({ setItem: () => { throw new Error("blocked"); } }, false)).not.toThrow();
  });
});

describe("accesibilidad", () => {
  for (const f of games) {
    it(`${f}: usa la preferencia de sonido compartida y el botón de sonido tiene nombre accesible`, () => {
      const src = read(`src/components/games/${f}`);
      expect(src).toMatch(/useSoundPreference\(\)/);
      expect(src).not.toMatch(/\[soundEnabled, setSoundEnabled\] = useState/);
      expect(src).toMatch(/aria-label="Activar o silenciar el sonido"/);
    });
  }
  it("se respeta prefers-reduced-motion", () => {
    expect(read("src/app/globals.css")).toMatch(/prefers-reduced-motion: reduce/);
  });
  it("las imágenes decorativas de juegos llevan alt", () => {
    expect(read("src/components/games/space-cleanup-game.tsx")).not.toMatch(/<img\s(?![^>]*alt=)/);
  });
  it("el Comunicador Inverso no depende solo del color: muestra '¡IGUAL!' o '¡INVERSO!'", () => {
    const s = read("src/components/games/reverse-communicator-game.tsx");
    expect(s).toMatch(/¡IGUAL!/);
    expect(s).toMatch(/¡INVERSO!/);
  });
});
