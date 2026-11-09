"use client";
// Guardado de misiones del lado del navegador, a prueba de fallos:
//  - reintenta (el servidor es idempotente: una misión ya guardada no se duplica)
//  - si sigue fallando NO manda al niño al HQ: muestra un aviso con "Reintentar" (ver MissionSaveGuard)
//  - respalda la partida en localStorage para reenviarla después (ver PendingSavesSync en el HQ)
import { saveMissionProgress } from "@/app/actions/mission.actions";

export type MissionPayload = {
  kidId: string;
  missionId: string;
  reward: number;
  telemetry: any[];
};

type UiState = { failed: boolean; retrying: boolean; payload: MissionPayload | null };

const STORAGE_KEY = "neuroplay:pending-mission-saves";
let ui: UiState = { failed: false, retrying: false, payload: null };
const listeners = new Set<() => void>();
let navigateHome: () => void = () => {
  if (typeof window !== "undefined") window.location.href = "/hq";
};

const emit = (next: Partial<UiState>) => {
  ui = { ...ui, ...next };
  listeners.forEach((l) => l());
};
export const subscribeSaveState = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getSaveState = () => ui;
export const setNavigateHome = (fn: () => void) => {
  navigateHome = fn;
};

// ---- respaldo local ----
export function readPending(): MissionPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writePending(list: MissionPayload[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-10)));
  } catch {
    /* modo privado / sin espacio: se ignora */
  }
}
const addPending = (p: MissionPayload) =>
  writePending([...readPending().filter((x) => x.missionId !== p.missionId), p]);
const removePending = (missionId: string) =>
  writePending(readPending().filter((x) => x.missionId !== missionId));

// ---- reintentos ----
export async function saveWithRetry(
  attempt: () => Promise<{ success?: boolean } | undefined>,
  delaysMs: number[] = [400, 1200],
): Promise<boolean> {
  for (let i = 0; i <= delaysMs.length; i++) {
    try {
      const r = await attempt();
      if (r?.success) return true;
    } catch {
      /* red caída o error del servidor: se reintenta */
    }
    if (i < delaysMs.length) await new Promise((res) => setTimeout(res, delaysMs[i]));
  }
  return false;
}

const send = (p: MissionPayload) =>
  saveWithRetry(() => saveMissionProgress(p.kidId, p.missionId, p.reward, p.telemetry));

/** Lo usan los 14 juegos al terminar: guarda y vuelve al HQ, o avisa del error. */
export async function saveMissionAndGoHome(
  kidId: string,
  missionId: string,
  reward: number,
  telemetry: any[],
): Promise<boolean> {
  const payload = { kidId, missionId, reward, telemetry };
  if (await send(payload)) {
    removePending(missionId);
    navigateHome();
    return true;
  }
  addPending(payload);
  emit({ failed: true, retrying: false, payload });
  return false;
}

/** Botón "Reintentar" del aviso de error */
export async function retryFailedSave(): Promise<boolean> {
  const p = ui.payload;
  if (!p) return false;
  emit({ retrying: true });
  if (await send(p)) {
    removePending(p.missionId);
    emit({ failed: false, retrying: false, payload: null });
    navigateHome();
    return true;
  }
  emit({ retrying: false });
  return false;
}

/** Reenvía en silencio partidas guardadas en el respaldo local. Devuelve cuántas se recuperaron. */
export async function flushPendingSaves(kidId?: string): Promise<number> {
  let recovered = 0;
  for (const p of readPending()) {
    if (kidId && p.kidId !== kidId) continue;
    if (await send(p)) {
      removePending(p.missionId);
      recovered++;
    }
  }
  return recovered;
}

export const __resetForTests = () => {
  ui = { failed: false, retrying: false, payload: null };
  listeners.clear();
};
