import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AVATAR_MAP: Record<string, string> = {
  "default-cadet": "👨‍🚀",
  "turbo-helmet": "🪖",
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
