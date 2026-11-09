// Reglas puras (sin dependencias de servidor) para decidir quién puede editar el catálogo global
// de cursos/lecciones. Se puede conceder por rol en Clerk (publicMetadata.role) o por la lista
// CONTENT_EDITOR_USER_IDS (ids de Clerk separados por comas).
export const CONTENT_EDITOR_ROLES = ["admin", "therapist"] as const;

export function parseAllowList(raw: string | undefined | null): string[] {
  return (raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

export function isContentEditor(args: {
  userId: string | null | undefined;
  role?: unknown;
  allowList?: string[];
}): boolean {
  if (!args.userId) return false;
  if ((args.allowList ?? []).includes(args.userId)) return true;
  return typeof args.role === "string" && (CONTENT_EDITOR_ROLES as readonly string[]).includes(args.role);
}

// Límites de contenido subido (evita abuso de almacenamiento y de la API de voz)
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const TTS_MAX_CHARS_PER_BLOCK = 8000;
export const TTS_MAX_BLOCKS_PER_LESSON = 6;
export const TTS_MAX_CHARS_PER_LESSON = 20000;

export function validateImageFile(file: { size: number; type: string } | null | undefined): string | null {
  if (!file || file.size === 0) return null; // opcional
  if (!UPLOAD_ALLOWED_TYPES.includes(file.type)) return "Formato de imagen no permitido (usa JPG, PNG, WebP o GIF).";
  if (file.size > UPLOAD_MAX_BYTES) return "La imagen supera el máximo de 5 MB.";
  return null;
}

export function validateTtsBlocks(blocks: Array<{ type?: string; scriptText?: string }>): string | null {
  const audio = blocks.filter((b) => b.type === "lessonAudio" && b.scriptText);
  if (audio.length > TTS_MAX_BLOCKS_PER_LESSON) return `Máximo ${TTS_MAX_BLOCKS_PER_LESSON} audios por lección.`;
  let total = 0;
  for (const b of audio) {
    const n = (b.scriptText ?? "").length;
    if (n > TTS_MAX_CHARS_PER_BLOCK) return `Un guion de audio no puede superar ${TTS_MAX_CHARS_PER_BLOCK} caracteres.`;
    total += n;
  }
  if (total > TTS_MAX_CHARS_PER_LESSON) return `Los audios de una lección no pueden superar ${TTS_MAX_CHARS_PER_LESSON} caracteres en total.`;
  return null;
}

// Slug sin tildes ("Atención" -> "atencion"; antes salía "atenci-n"). Nunca vacío.
export function slugify(title: string, fallback = "contenido"): string {
  const s = String(title ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
  return s || fallback;
}

// Recompensa de un bloque: 0 es válido (antes `parseInt(x) || 10` lo convertía en 10), tope 100.
export function parseReward(value: unknown, fallback: number): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 0), 100);
}
