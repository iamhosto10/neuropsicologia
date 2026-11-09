// Sincronización Clerk -> Sanity (usuarios y borrado en cascada). Sin dependencias de Next
// para poder probarla con un cliente falso.
export type SanityLike = {
  createIfNotExists: (doc: any) => Promise<any>;
  fetch: <T = any>(q: string, p?: any) => Promise<T>;
  transaction: () => { delete: (id: string) => any; commit: () => Promise<any> };
};

export type ClerkUserLike = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export const sanityUserId = (clerkId: string) => `user-${clerkId}`;

// Crea el documento `user` si no existe (idempotente). Lo usan el webhook Y createKidProfile,
// así un perfil nunca falla porque el webhook no corrió.
export async function ensureSanityUser(sanity: SanityLike, u: ClerkUserLike) {
  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Nuevo Usuario";
  await sanity.createIfNotExists({
    _id: sanityUserId(u.id),
    _type: "user",
    name,
    clerkId: u.id,
    email: u.email ?? undefined,
    role: "free",
    slug: { _type: "slug", current: name.toLowerCase().replace(/\s+/g, "-").slice(0, 96) },
  });
}

// Borra un cadete junto con todo lo que lo referencia (sesiones diarias). Sanity rechaza
// borrar un documento con referencias entrantes, por eso va todo en UNA transacción.
export async function deleteKidCascade(sanity: SanityLike, kidId: string) {
  const refs = await sanity.fetch<string[]>(`*[references($kidId) && _id != $kidId]._id`, { kidId });
  const tx = sanity.transaction();
  for (const id of refs) tx.delete(id);
  tx.delete(kidId);
  await tx.commit();
  return { deletedRelated: refs.length };
}

// Cuenta de Clerk eliminada: se borran su usuario, sus cadetes y las sesiones de éstos.
export async function deleteUserCascade(sanity: SanityLike, clerkId: string) {
  const userId = sanityUserId(clerkId);
  const kids = await sanity.fetch<string[]>(`*[_type == "kidProfile" && parent._ref == $userId]._id`, { userId });
  const related = kids.length
    ? await sanity.fetch<string[]>(`*[references($kids)]._id`, { kids })
    : [];
  const ids = new Set<string>([...related.filter((id) => id !== userId), ...kids, userId]);
  const tx = sanity.transaction();
  for (const id of ids) tx.delete(id);
  await tx.commit();
  return { deleted: ids.size };
}
