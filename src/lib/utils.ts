import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AVATAR_MAP: Record<string, string> = {
  "default-cadet": "👨‍🚀",
  "turbo-helmet": "🪖",
  "casco-turbo": "🪖",
  // Avatares de demo (scripts/seed-avatars.mjs)
  "piloto-cohete": "🚀",
  "alien-amigo": "👽",
  "robot-r2": "🤖",
  "gato-astronauta": "🐱",
  "unicornio-galactico": "🦄",
  "dragon-estelar": "🐉",
  "corona-comandante": "👑",
  "alien-pet": "👾",
  "gold-commander": "👑",
};

// Función para obtener el ícono seguro (si no existe, devuelve el cadete base)
export function getAvatarIcon(id?: string) {
  return AVATAR_MAP[id || "default-cadet"] || "👨‍🚀";
}

// Fecha "de hoy" (YYYY-MM-DD) en la zona horaria de la app, no en UTC.
// Con toISOString(), después de las 7pm en Colombia ya sería "mañana".
export const APP_TIME_ZONE =
  process.env.NEXT_PUBLIC_APP_TIME_ZONE || "America/Bogota";

export function getTodayDate(date: Date = new Date()) {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Reloj mm:ss para los HUD de los juegos (antes varios mostraban "00:{seg % 60}",
// que con 60 s arrancaba en 00:00 y con 120 s contaba dos veces).
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
