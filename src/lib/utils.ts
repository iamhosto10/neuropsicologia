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
