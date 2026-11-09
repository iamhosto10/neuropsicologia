// Política de recompensas ("base + bonus"), decidida por el cliente del proyecto:
//  - 50 % del máximo de la misión por COMPLETARLA CON PARTICIPACIÓN (al menos una respuesta del niño)
//  - el otro 50 % escala con la PRECISIÓN de la partida
//  - sin ninguna respuesta (el niño no hizo nada) no se paga
// Se calcula en el SERVIDOR con la telemetría guardada; el valor que mande el navegador se ignora.
import { computeAccuracy } from "@/lib/telemetry-engine";

export const BASE_SHARE = 0.5;

const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** ¿El niño respondió/interactuó al menos una vez? (cada juego guarda métricas distintas) */
export function hasResponses(m: Record<string, any>): boolean {
  if (m.accuracyRate !== undefined) return n(m.correctAnswers) + n(m.errorCount) > 0; // Warp
  if (m.successfulDocks !== undefined && m.totalAttempts !== undefined) return n(m.totalAttempts) > 0; // Acoplamiento
  if (m.stagesCompleted !== undefined && m.invalidMoves !== undefined) return n(m.totalMoves) > 0 || n(m.stagesCompleted) > 0; // Casco
  if (m.invalidPours !== undefined && m.undosUsed !== undefined) return n(m.totalMoves) > 0; // Fluidos
  if (m.correctClicks !== undefined && m.incorrectClicks !== undefined) return n(m.correctClicks) + n(m.incorrectClicks) > 0; // Limpieza
  if (m.accuracyCongruentPercent !== undefined) return n(m.totalTrials) - n(m.omissions) > 0; // Nebulosa
  if (m.accuracyDirectPercent !== undefined) {
    // Panel de Seguridad (totalRounds) y Comunicador Inverso (totalAttempts - omisiones)
    return (m.totalRounds !== undefined ? n(m.totalRounds) : n(m.totalAttempts) - n(m.totalOmissions)) > 0;
  }
  if (m.timeOnTargetPercentage !== undefined) return n(m.timeOnTargetPercentage) > 0 || n(m.criticalEventsCaught) > 0 || n(m.falsePositives) > 0; // Satélite
  if (m.truePositives !== undefined) return n(m.truePositives) + n(m.trueNegatives) + n(m.falsePositives) > 0; // N-Back
  if (m.correctHits !== undefined) return n(m.correctHits) + n(m.commissionErrors) > 0; // Asteroides (Go/No-Go)
  if (m.correctNumbersCaught !== undefined) return n(m.correctNumbersCaught) + n(m.incorrectNumbersCaught) > 0; // Gran Evasión
  if (computeAccuracy(m) > 0) return true;
  return true; // forma desconocida: no se castiga
}

export function computeReward(metrics: Record<string, any> | null | undefined, maxReward: number): number {
  const max = Math.max(0, Math.round(Number(maxReward) || 0));
  if (!metrics || typeof metrics !== "object" || max === 0) return 0;
  if (!hasResponses(metrics)) return 0;
  const acc = Math.min(100, Math.max(0, Number(computeAccuracy(metrics)) || 0));
  return Math.round(max * BASE_SHARE + max * (1 - BASE_SHARE) * (acc / 100));
}
