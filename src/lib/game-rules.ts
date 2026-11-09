// Reglas de asignación de misiones compartidas por la UI (planificador) y el servidor.
export const GAME_TYPES = [
  "asteroids_go_nogo", "simon_says_reverse", "multitask_evasion", "reverse_communicator",
  "satellite_tracker", "space_cleanup", "cargo_n_back", "nebula_storm", "signal_decoder",
  "navigation", "warp_drive", "star_docking", "hull_disassembly", "water_sort",
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const MAX_MISSIONS_PER_DAY = 5;
export const MAX_DURATION_SECONDS = 600;
export const MAX_REWARD = 500;
export const DEFAULT_MIN_DURATION = 20;

// Duración mínima jugable: p. ej. el Panel de Seguridad gasta ~9 s solo en mostrar y esperar el
// patrón; con 10 s el niño no llegaba a responder ninguna ronda y aun así cobraba la recompensa.
export const MIN_DURATION_BY_GAME: Record<string, number> = {
  simon_says_reverse: 45,
  navigation: 60,
  hull_disassembly: 45,
  water_sort: 45,
  star_docking: 30,
  cargo_n_back: 30,
};
export const minDurationFor = (gameType: string) => MIN_DURATION_BY_GAME[gameType] ?? DEFAULT_MIN_DURATION;

export type MissionInput = { gameType?: unknown; title?: unknown; difficulty?: unknown; timeLimit?: unknown; energyReward?: unknown };
export type CleanMission = { gameType: string; title: string; difficulty: string; timeLimit: number; energyReward: number };

export function validateMissions(input: unknown): { ok: true; missions: CleanMission[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "Debes configurar al menos una misión." };
  if (input.length > MAX_MISSIONS_PER_DAY)
    return { ok: false, error: `Un cadete no debe tener más de ${MAX_MISSIONS_PER_DAY} misiones al día.` };
  const missions: CleanMission[] = [];
  for (const m of input as MissionInput[]) {
    const gameType = String(m?.gameType ?? "");
    if (!(GAME_TYPES as readonly string[]).includes(gameType)) return { ok: false, error: "Juego no válido." };
    const difficulty = String(m?.difficulty ?? "medium");
    if (!(DIFFICULTIES as readonly string[]).includes(difficulty)) return { ok: false, error: "Dificultad no válida." };
    const timeLimit = Math.round(Number(m?.timeLimit));
    const min = minDurationFor(gameType);
    if (!Number.isFinite(timeLimit) || timeLimit < min || timeLimit > MAX_DURATION_SECONDS)
      return { ok: false, error: `La duración de este juego debe estar entre ${min} y ${MAX_DURATION_SECONDS} segundos.` };
    const reward = Math.round(Number(m?.energyReward));
    if (!Number.isFinite(reward) || reward < 0 || reward > MAX_REWARD)
      return { ok: false, error: `Los cristales deben estar entre 0 y ${MAX_REWARD}.` };
    missions.push({ gameType, title: String(m?.title ?? "Misión Terapéutica").slice(0, 80), difficulty, timeLimit, energyReward: reward });
  }
  return { ok: true, missions };
}

export const isValidDate = (d: unknown): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
