import { beforeEach, describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { formatClock } from "@/lib/utils";
import { DEFAULT_MIN_DURATION, minDurationFor, validateMissions } from "@/lib/game-rules";
import { combineDirectReverse, generateAccuracyChartData, parseTelemetryHistory } from "@/lib/telemetry-engine";
import { warpAccuracy } from "@/hooks/useWarpDriveEngine";
import { eventChancePerTick, stepSignal } from "@/hooks/useSatelliteEngine";
import { isHullStuck, type Hole, type Plate } from "@/hooks/useHullEngine";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");
const gameFiles = readdirSync(path.join(root, "src/components/games")).filter((f) => f.endsWith("-game.tsx"));
const hookFiles = readdirSync(path.join(root, "src/hooks")).filter((f) => f.endsWith("Engine.ts"));

describe("ítem 8: reloj", () => {
  it("formatClock mm:ss", () => {
    expect(formatClock(60)).toBe("01:00"); // antes "00:00"
    expect(formatClock(120)).toBe("02:00"); // antes contaba dos veces
    expect(formatClock(90)).toBe("01:30");
    expect(formatClock(59)).toBe("00:59");
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(-5)).toBe("00:00");
    expect(formatClock(NaN)).toBe("00:00");
  });
  for (const f of gameFiles) {
    it(`${f} no usa el formato roto "00:{seg % 60}"`, () => {
      const src = read(`src/components/games/${f}`);
      expect(src).not.toMatch(/00:\{\(/);
    });
  }
});

describe("ítem 9: duraciones", () => {
  it("Laboratorio de Carga respeta la duración configurada", () => {
    expect(read("src/components/games/cargo-laboratory-game.tsx")).toMatch(/duration: config\.duration \|\| 40/);
  });
  const ok = { gameType: "warp_drive", title: "t", difficulty: "easy", timeLimit: 60, energyReward: 50 };
  it("acepta una misión válida", () => {
    expect(validateMissions([ok])).toMatchObject({ ok: true });
  });
  it("Panel de Seguridad con 10 s es inviable y se rechaza; con 45 s sí", () => {
    expect(minDurationFor("simon_says_reverse")).toBeGreaterThan(10);
    expect(validateMissions([{ ...ok, gameType: "simon_says_reverse", timeLimit: 10 }])).toMatchObject({ ok: false });
    expect(validateMissions([{ ...ok, gameType: "simon_says_reverse", timeLimit: 45 }])).toMatchObject({ ok: true });
    expect(minDurationFor("juego-desconocido")).toBe(DEFAULT_MIN_DURATION);
  });
  it("rechaza juegos, dificultades, duraciones y cristales fuera de rango, y más de 5 misiones", () => {
    for (const bad of [
      { ...ok, gameType: "hack" }, { ...ok, difficulty: "extreme" }, { ...ok, timeLimit: 99999 },
      { ...ok, timeLimit: "abc" }, { ...ok, energyReward: -1 }, { ...ok, energyReward: 100000 },
    ]) expect(validateMissions([bad])).toMatchObject({ ok: false });
    expect(validateMissions(Array(6).fill(ok))).toMatchObject({ ok: false });
    expect(validateMissions([])).toMatchObject({ ok: false });
    expect(validateMissions(null)).toMatchObject({ ok: false });
  });
});

describe("ítem 10: el fin de partida no se dispara dentro de un setState", () => {
  for (const f of hookFiles) {
    it(`${f} no llama finishGame dentro del updater de setTimeLeft`, () => {
      const src = read(`src/hooks/${f}`);
      expect(src).not.toMatch(/setTimeLeft\(\(prev\)\s*=>\s*\{[^}]*finishGame/);
    });
  }
});

describe("ítem 11: reportes clínicos", () => {
  it("fácil sin rondas inversas: un niño perfecto ya no sale con 50 %", () => {
    expect(combineDirectReverse({ accuracyDirectPercent: 100, accuracyReversePercent: 0, directRounds: 5, reverseRounds: 0 })).toBe(100);
  });
  it("con ambos tipos de ronda promedia", () => {
    expect(combineDirectReverse({ accuracyDirectPercent: 100, accuracyReversePercent: 50, directRounds: 4, reverseRounds: 2 })).toBe(75);
  });
  it("falló todas las inversas (sí las jugó): cuenta 0 en el promedio", () => {
    expect(combineDirectReverse({ accuracyDirectPercent: 100, accuracyReversePercent: 0, directRounds: 4, reverseRounds: 3 })).toBe(50);
  });
  it("datos antiguos sin conteos: sin acierto ni span inverso se asume que no hubo inversas", () => {
    expect(combineDirectReverse({ accuracyDirectPercent: 90, accuracyReversePercent: 0, maxSequenceReverse: 0 })).toBe(90);
    expect(combineDirectReverse({ accuracyDirectPercent: 90, accuracyReversePercent: 60, maxSequenceReverse: 4 })).toBe(75);
  });
  it("la precisión de Warp usa intentos respondidos (4 aciertos, 0 errores = 100 %, no 80 %)", () => {
    expect(warpAccuracy(4, 0)).toBe(100);
    expect(warpAccuracy(3, 1)).toBe(75);
    expect(warpAccuracy(0, 0)).toBe(0);
  });
  it("la gráfica agrupa por fecha completa (mismo DD/MM de años distintos no se mezcla)", () => {
    const mk = (date: string, acc: number) => ({
      date,
      telemetryData: [JSON.stringify({ gameType: "warp_drive", metrics: { accuracyRate: acc } })],
    });
    const events = parseTelemetryHistory([mk("2026-11-09", 100), mk("2025-11-09", 0)]);
    const chart = generateAccuracyChartData(events);
    expect(chart).toHaveLength(2);
    expect(chart.map((c: any) => c.precision).sort()).toEqual([0, 100]);
  });
  it("la ficha dice 'Cristales Disponibles' y cuenta días jugados, y la query trae 30 sesiones", () => {
    const page = read("src/app/(login)/dashboard/kid/[id]/page.tsx");
    expect(page).toMatch(/Cristales Disponibles/);
    expect(page).not.toMatch(/Cristales Generados/);
    expect(page).toMatch(/trainedDays/);
    expect(read("src/sanity/lib/queries.ts")).toMatch(/\[0\.\.\.30\]/);
  });
});

describe("ítem 13: Rastreador Satelital", () => {
  it("la señal se vacía igual a 60 Hz que a 120/144 Hz", () => {
    const run = (hz: number) => {
      let s = 100;
      for (let i = 0; i < hz; i++) s = stepSignal(s, false, 60 / hz, 1);
      return s;
    };
    expect(run(60)).toBeCloseTo(run(120), 5);
    expect(run(60)).toBeCloseTo(run(144), 5);
  });
  it("la probabilidad de evento por segundo no depende de la frecuencia", () => {
    const perSecond = (hz: number) => 1 - Math.pow(1 - eventChancePerTick(0.008, 60 / hz), hz);
    expect(perSecond(120)).toBeCloseTo(perSecond(60), 6);
    expect(perSecond(144)).toBeCloseTo(perSecond(60), 6);
  });
  it("mantener sobre el satélite recarga y nunca pasa de 100", () => {
    expect(stepSignal(99.9, true, 5, 1)).toBe(100);
    expect(stepSignal(10, true, 1, 1)).toBeGreaterThan(10);
  });
  it("usa eventos pointer (táctil), no solo mouse", () => {
    const src = read("src/components/games/satellite-tracker-game.tsx");
    expect(src).not.toMatch(/onMouseEnter|onMouseLeave/);
    expect(src).toMatch(/onPointerEnter/);
    expect(src).toMatch(/onPointerLeave/);
  });
});

describe("ítem 14: Desensamblaje del Casco", () => {
  const holes = (...hasBolt: boolean[]): Hole[] => hasBolt.map((b, id) => ({ id, hasBolt: b }));
  const plate = (id: string, covered: number[], fallen = false): Plate => ({ id, coveredHoles: covered, color: "", zIndex: 1, isFallen: fallen, x: 0, y: 0, w: 0, h: 0 });
  it("sin salida: todos los agujeros libres están tapados por placas", () => {
    expect(isHullStuck(holes(true, false, false), [plate("a", [0, 1, 2])])).toBe(true);
  });
  it("hay un agujero libre y descubierto: se puede mover", () => {
    expect(isHullStuck(holes(true, false, false), [plate("a", [0, 1])])).toBe(false);
  });
  it("nivel completo o sin placas: no es bloqueo", () => {
    expect(isHullStuck(holes(false, false), [plate("a", [0], true)])).toBe(false);
    expect(isHullStuck(holes(true), [])).toBe(false);
  });
  it("las placas caídas dejan de tapar", () => {
    expect(isHullStuck(holes(true, false), [plate("a", [1], true), plate("b", [0])])).toBe(false);
  });
  it("el juego ofrece el botón de reiniciar sector", () => {
    expect(read("src/components/games/hull-disassembly-game.tsx")).toMatch(/resetStage/);
  });
});

describe("ítem 12: reasignar un día reinicia el progreso", () => {
  let s: any;
  beforeEach(async () => {
    const { freshWorld } = await import("./helpers/setup");
    s = freshWorld();
    s.seed({
      _id: "sessX", _type: "dailySession", kidProfile: { _ref: "kid1" }, date: "2999-01-01",
      missions: [{ _key: "old1" }, { _key: "old2" }], completedMissions: ["old1", "old2"], isCompleted: true,
      telemetryData: ["{\"x\":1}"],
    });
    s.resolvers.unshift([/_type == "dailySession" && kidProfile\._ref == \$kidId && date == \$date/, (p: any, st: any) =>
      Object.values(st.docs).find((d: any) => d._type === "dailySession" && d.kidProfile._ref === p.kidId && d.date === p.date) ?? null]);
  });
  const cfg = [{ gameType: "warp_drive", title: "Warp", difficulty: "easy", timeLimit: 60, energyReward: 50 }];
  const run = async (date: string, c: any = cfg) => {
    const { assignDailySession } = await import("@/app/actions/mission.actions");
    try { return await assignDailySession("kid1", date, c); } catch (e: any) { return { redirected: e.message }; }
  };
  it("al sobrescribir: misiones nuevas, completedMissions vacío, isCompleted false y la telemetría se conserva", async () => {
    expect(await run("2999-01-01")).toEqual({ redirected: "NEXT_REDIRECT:/dashboard/kid/kid1" });
    expect(s.docs.sessX.missions).toHaveLength(1);
    expect(s.docs.sessX.missions[0].gameType).toBe("warp_drive");
    expect(s.docs.sessX.completedMissions).toEqual([]);
    expect(s.docs.sessX.isCompleted).toBe(false);
    expect(s.docs.sessX.telemetryData).toHaveLength(1);
  });
  it("crea sesión nueva si no existe", async () => {
    await run("2999-02-02");
    const created: any = Object.values(s.docs).find((d: any) => d.date === "2999-02-02");
    expect(created).toMatchObject({ completedMissions: [], isCompleted: false });
  });
  it("valida en el servidor: juego, duración, fecha pasada, más de 5, cadete ajeno", async () => {
    expect(await run("2999-01-01", [{ ...cfg[0], gameType: "x" }])).toHaveProperty("error");
    expect(await run("2999-01-01", [{ ...cfg[0], timeLimit: 1 }])).toHaveProperty("error");
    expect(await run("2000-01-01")).toHaveProperty("error");
    expect(await run("no-es-fecha")).toHaveProperty("error");
    expect(await run("2999-01-01", Array(6).fill(cfg[0]))).toHaveProperty("error");
    const { state } = await import("./helpers/setup");
    state.owned = false;
    expect(await run("2999-01-01")).toMatchObject({ error: "No autorizado" });
    expect(s.docs.sessX.completedMissions).toEqual(["old1", "old2"]);
  });
});
