import { describe, expect, it } from "vitest";
import { computeReward, hasResponses } from "@/lib/reward-policy";

describe("política de recompensas: base + bonus", () => {
  it("precisión 100 % paga el máximo; 0 % con participación paga la base (50 %)", () => {
    expect(computeReward({ accuracyRate: 100, correctAnswers: 5, errorCount: 0 }, 50)).toBe(50);
    expect(computeReward({ accuracyRate: 0, correctAnswers: 0, errorCount: 4 }, 50)).toBe(25);
    expect(computeReward({ accuracyRate: 50, correctAnswers: 2, errorCount: 2 }, 50)).toBe(38); // 25 + 12.5
  });
  it("sin ninguna respuesta no se paga (antes pagaba el máximo)", () => {
    expect(computeReward({ accuracyRate: 0, correctAnswers: 0, errorCount: 0 }, 50)).toBe(0); // Warp sin responder
    expect(computeReward({ correctHits: 0, commissionErrors: 0, correctRejections: 0, omissionErrors: 2, avgReactionTimeMs: 0 }, 50)).toBe(0); // Asteroides sin tocar
    expect(computeReward({ accuracyDirectPercent: 0, accuracyReversePercent: 0, totalRounds: 0 }, 50)).toBe(0); // Panel de Seguridad sin llegar a responder
    expect(computeReward({ timeOnTargetPercentage: 0, criticalEventsCaught: 0, falsePositives: 0 }, 50)).toBe(0); // Satélite sin interacción
  });
  it("respuestas todas erróneas SÍ participan (base) y no se castiga al niño que lo intentó", () => {
    expect(computeReward({ correctHits: 0, commissionErrors: 3, correctRejections: 0 }, 40)).toBe(20);
    expect(computeReward({ truePositives: 0, trueNegatives: 0, falsePositives: 2, falseNegatives: 3 }, 40)).toBe(20);
  });
  it("máximo 0 o telemetría inválida no pagan; el resultado nunca supera el máximo", () => {
    expect(computeReward({ accuracyRate: 100, correctAnswers: 1 }, 0)).toBe(0);
    expect(computeReward(null, 50)).toBe(0);
    expect(computeReward(undefined, 50)).toBe(0);
    expect(computeReward({ accuracyRate: 9999, correctAnswers: 1, errorCount: 0 }, 50)).toBe(50);
    expect(computeReward({ accuracyRate: -50, correctAnswers: 0, errorCount: 3 }, 50)).toBe(25);
  });
  it("forma de telemetría desconocida: no se castiga (participación asumida)", () => {
    expect(hasResponses({ algoNuevo: 1 })).toBe(true);
  });
  it("Casco, Fluidos y Acoplamiento: sin movimientos no paga; con movimientos sí", () => {
    expect(hasResponses({ stagesCompleted: 0, invalidMoves: 0, totalMoves: 0 })).toBe(false);
    expect(hasResponses({ stagesCompleted: 0, invalidMoves: 1, totalMoves: 3 })).toBe(true);
    expect(hasResponses({ invalidPours: 0, undosUsed: 0, totalMoves: 0 })).toBe(false);
    expect(hasResponses({ successfulDocks: 0, totalAttempts: 2 })).toBe(true);
  });
});
