// Utilidades para escrituras seguras en Sanity (server-only).
import "server-only";

// Reintenta cuando otra petición modificó el documento a la vez
// (ifRevisionID no coincide => HTTP 409). Cada intento debe volver a LEER.
export async function retryOnConflict<T>(fn: () => Promise<T>, tries = 6): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      if (e?.statusCode !== 409) throw e;
      // pequeña espera aleatoria para que los competidores no choquen otra vez a la vez
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 80 * (i + 1)));
    }
  }
  throw lastError;
}

// Evita interpolar ids arbitrarios en rutas de patch/GROQ.
export const SAFE_ID = /^[A-Za-z0-9_.-]{1,128}$/;
export const isSafeId = (v: unknown): v is string => typeof v === "string" && SAFE_ID.test(v);
