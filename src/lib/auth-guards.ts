// src/lib/auth-guards.ts
// Verificaciones de autorización compartidas por server actions y páginas.
// Las server actions son endpoints públicos: cualquiera puede llamarlas con
// cualquier kidId, así que el dueño se valida siempre en el servidor.
import "server-only";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { writeClient } from "@/sanity/lib/client";

// ID del documento `user` en Sanity del padre/terapeuta con sesión iniciada.
export async function getParentSanityId() {
  const { userId } = await auth();
  return userId ? `user-${userId}` : null;
}

// ¿El cadete pertenece al usuario con sesión iniciada?
export async function isKidOwnedByCurrentUser(kidId: string | null | undefined) {
  if (!kidId) return false;
  const parentSanityId = await getParentSanityId();
  if (!parentSanityId) return false;

  const count = await writeClient.fetch<number>(
    `count(*[_type == "kidProfile" && _id == $kidId && parent._ref == $parentSanityId])`,
    { kidId, parentSanityId },
  );
  return count > 0;
}

// El cadete activo (cookie), solo si pertenece al usuario con sesión iniciada.
export async function getOwnedActiveKidId() {
  const cookieStore = await cookies();
  const kidId = cookieStore.get("activeKidId")?.value;
  return (await isKidOwnedByCurrentUser(kidId)) ? kidId! : null;
}
