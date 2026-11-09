import { beforeEach, describe, expect, it } from "vitest";
import { freshWorld, state } from "./helpers/setup";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { purchaseItem } from "@/app/actions/store.actions";
import type { FakeSanity } from "./helpers/fake-sanity";

let s: FakeSanity;
const kid = () => s.docs.kid1;
const sess = () => s.docs.sess1;

beforeEach(() => {
  s = freshWorld();
  s.seed({
    _id: "sess1",
    _type: "dailySession",
    kidProfile: { _ref: "kid1" },
    date: "2026-11-09",
    missions: [
      { _key: "m1", gameType: "warp_drive", energyReward: 50 },
      { _key: "m2", gameType: "navigation", energyReward: 30 },
    ],
    completedMissions: [],
    isCompleted: false,
  });
});

describe("saveMissionProgress", () => {
  it("guarda telemetría con gameType, marca la misión y suma cristales", async () => {
    const r = await saveMissionProgress("kid1", "m1", 50, [{ accuracyRate: 80 }]);
    expect(r).toEqual({ success: true });
    expect(kid().energyCrystals).toBe(50);
    expect(sess().completedMissions).toEqual(["m1"]);
    expect(JSON.parse(sess().telemetryData[0])).toMatchObject({ gameType: "warp_drive", metrics: { accuracyRate: 80 } });
    expect(sess().isCompleted).toBe(false);
  });
  it("completa el día al terminar todas", async () => {
    await saveMissionProgress("kid1", "m1", 50, [{}]);
    await saveMissionProgress("kid1", "m2", 30, [{}]);
    expect(sess().isCompleted).toBe(true);
  });
  it("nunca paga más que energyReward ni negativos", async () => {
    await saveMissionProgress("kid1", "m1", 99999, [{}]);
    expect(kid().energyCrystals).toBe(50);
    await saveMissionProgress("kid1", "m2", -500, [{}]);
    expect(kid().energyCrystals).toBe(50);
  });
  it("doble envío de la misma misión: una sola recompensa y una sola telemetría", async () => {
    await saveMissionProgress("kid1", "m1", 50, [{}]);
    await saveMissionProgress("kid1", "m1", 50, [{}]);
    expect(kid().energyCrystals).toBe(50);
    expect(sess().telemetryData).toHaveLength(1);
  });
  it("con una escritura concurrente (409) reintenta y no duplica", async () => {
    let first = true;
    s.beforeCommit = () => {
      if (first) {
        first = false;
        s.touch("sess1");
      }
    };
    expect(await saveMissionProgress("kid1", "m1", 50, [{}])).toEqual({ success: true });
    expect(kid().energyCrystals).toBe(50);
    expect(sess().telemetryData).toHaveLength(1);
  });
  it("rechaza telemetría gigante, no-objeto o llave inexistente", async () => {
    expect((await saveMissionProgress("kid1", "m1", 50, [{ x: "y".repeat(6000) }])).success).toBe(false);
    expect((await saveMissionProgress("kid1", "m1", 50, ["texto"])).success).toBe(false);
    expect((await saveMissionProgress("kid1", "m1", 50, [])).success).toBe(false);
    expect((await saveMissionProgress("kid1", "nope", 50, [{}])).success).toBe(false);
    expect(kid().energyCrystals).toBe(0);
    expect(sess().telemetryData).toBeUndefined();
  });
  it("cadete ajeno: no escribe", async () => {
    state.owned = false;
    expect((await saveMissionProgress("kid1", "m1", 50, [{}])).success).toBe(false);
    expect(kid().energyCrystals).toBe(0);
  });
});

describe("purchaseItem", () => {
  it("cobra el precio de Sanity (ignora el del navegador) y desbloquea", async () => {
    s.docs.kid1.energyCrystals = 100;
    expect(await purchaseItem("kid1", "cheap", 0)).toEqual({ success: true });
    expect(kid().energyCrystals).toBe(80);
    expect(kid().unlockedAvatars).toEqual(["cheap"]);
    expect(kid().activeAvatar).toBe("cheap");
  });
  it("no alcanza el saldo / ya lo tiene / no existe", async () => {
    s.docs.kid1.energyCrystals = 10;
    expect(await purchaseItem("kid1", "pricey", 1)).toHaveProperty("error");
    s.docs.kid1.energyCrystals = 100;
    await purchaseItem("kid1", "cheap", 1);
    expect(await purchaseItem("kid1", "cheap", 1)).toMatchObject({ error: "¡Ya tienes este artículo!" });
    expect(await purchaseItem("kid1", "fantasma", 1)).toHaveProperty("error");
    expect(kid().energyCrystals).toBe(80);
  });
  it("carrera: compra concurrente con saldo para uno solo nunca deja saldo negativo ni duplica", async () => {
    s.docs.kid1.energyCrystals = 100;
    let first = true;
    // mientras se compra "pricey", otra compra ("cheap") gana la carrera
    s.beforeCommit = () => {
      if (first) {
        first = false;
        s.docs.kid1.energyCrystals -= 90;
        s.docs.kid1.unlockedAvatars = ["otro"];
        s.touch("kid1");
      }
    };
    const r = await purchaseItem("kid1", "pricey", 80);
    expect(r).toHaveProperty("error"); // al releer ya no alcanza
    expect(kid().energyCrystals).toBe(10);
    expect(kid().energyCrystals).toBeGreaterThanOrEqual(0);
  });
});
