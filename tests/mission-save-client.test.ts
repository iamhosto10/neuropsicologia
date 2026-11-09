import { beforeEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const action = vi.hoisted(() => ({ fn: vi.fn() }));
vi.mock("@/app/actions/mission.actions", () => ({ saveMissionProgress: (...a: any[]) => action.fn(...a) }));

import {
  __resetForTests,
  flushPendingSaves,
  getSaveState,
  readPending,
  retryFailedSave,
  saveMissionAndGoHome,
  saveWithRetry,
  setNavigateHome,
} from "@/lib/mission-save-client";

const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => void (store[k] = v),
  removeItem: (k: string) => void delete store[k],
};

let home: ReturnType<typeof vi.fn>;
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  __resetForTests();
  action.fn.mockReset();
  home = vi.fn();
  setNavigateHome(home as any);
  vi.useFakeTimers();
});

const run = async <T,>(p: Promise<T>) => {
  await vi.runAllTimersAsync();
  return p;
};

describe("saveWithRetry", () => {
  it("éxito inmediato", async () => {
    expect(await run(saveWithRetry(async () => ({ success: true })))).toBe(true);
  });
  it("reintenta si la acción lanza error o responde success:false", async () => {
    const f = vi.fn().mockRejectedValueOnce(new Error("red")).mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
    expect(await run(saveWithRetry(f))).toBe(true);
    expect(f).toHaveBeenCalledTimes(3);
  });
  it("se rinde tras agotar los intentos", async () => {
    const f = vi.fn().mockResolvedValue({ success: false });
    expect(await run(saveWithRetry(f))).toBe(false);
    expect(f).toHaveBeenCalledTimes(3);
  });
});

describe("fin de misión", () => {
  it("guardado OK: vuelve al HQ y no deja nada pendiente", async () => {
    action.fn.mockResolvedValue({ success: true });
    await run(saveMissionAndGoHome("k", "m1", 50, [{ a: 1 }]));
    expect(action.fn).toHaveBeenCalledWith("k", "m1", 50, [{ a: 1 }]);
    expect(home).toHaveBeenCalledTimes(1);
    expect(getSaveState().failed).toBe(false);
    expect(readPending()).toEqual([]);
  });

  it("guardado falla: NO manda al niño al HQ, muestra el error y respalda la partida", async () => {
    action.fn.mockResolvedValue({ success: false });
    const ok = await run(saveMissionAndGoHome("k", "m1", 50, [{ a: 1 }]));
    expect(ok).toBe(false);
    expect(home).not.toHaveBeenCalled();
    expect(getSaveState()).toMatchObject({ failed: true, retrying: false });
    expect(readPending()).toHaveLength(1);
    expect(readPending()[0]).toMatchObject({ kidId: "k", missionId: "m1", reward: 50 });
  });

  it("la acción lanza una excepción (red caída): mismo comportamiento seguro", async () => {
    action.fn.mockRejectedValue(new Error("Failed to fetch"));
    await run(saveMissionAndGoHome("k", "m1", 50, [{}]));
    expect(getSaveState().failed).toBe(true);
    expect(home).not.toHaveBeenCalled();
  });

  it("Reintentar: al funcionar vuelve al HQ, limpia el aviso y el respaldo", async () => {
    action.fn.mockResolvedValue({ success: false });
    await run(saveMissionAndGoHome("k", "m1", 50, [{}]));
    action.fn.mockResolvedValue({ success: true });
    expect(await run(retryFailedSave())).toBe(true);
    expect(home).toHaveBeenCalledTimes(1);
    expect(getSaveState().failed).toBe(false);
    expect(readPending()).toEqual([]);
  });

  it("Reintentar que vuelve a fallar mantiene el aviso", async () => {
    action.fn.mockResolvedValue({ success: false });
    await run(saveMissionAndGoHome("k", "m1", 50, [{}]));
    expect(await run(retryFailedSave())).toBe(false);
    expect(getSaveState()).toMatchObject({ failed: true, retrying: false });
    expect(home).not.toHaveBeenCalled();
  });

  it("respaldo local: el HQ recupera partidas pendientes de ese cadete", async () => {
    action.fn.mockResolvedValue({ success: false });
    await run(saveMissionAndGoHome("k", "m1", 50, [{}]));
    await run(saveMissionAndGoHome("otro", "m2", 50, [{}]));
    action.fn.mockResolvedValue({ success: true });
    expect(await run(flushPendingSaves("k"))).toBe(1);
    expect(readPending().map((p) => p.missionId)).toEqual(["m2"]);
  });
});

describe("regla de código: los juegos no llaman a saveMissionProgress directamente", () => {
  const dir = path.resolve(__dirname, "../src/components/games");
  for (const f of readdirSync(dir).filter((x) => x.endsWith("-game.tsx"))) {
    it(`${f} usa saveMissionAndGoHome`, () => {
      const src = readFileSync(path.join(dir, f), "utf8");
      expect(src).not.toMatch(/saveMissionProgress/);
      expect(src).toMatch(/saveMissionAndGoHome/);
    });
  }
  it("la página de misión monta el aviso de error", () => {
    const src = readFileSync(path.resolve(__dirname, "../src/app/(kids-hub)/misiones/[id]/page.tsx"), "utf8");
    expect(src).toMatch(/<MissionSaveGuard/);
  });
});
