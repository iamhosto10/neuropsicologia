// src/app/actions/activity.actions.ts
"use server";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";
import { isSafeId, retryOnConflict } from "@/lib/sanity-safe";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

const ACTIVITY_REWARD = 20;

export async function markActivityCompleted(
  kidId: string,
  activityId: string,
  currentPath: string,
  reflectionData?: { mood: string; difficulty: number },
) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };
  if (!isSafeId(activityId)) return { error: "Actividad no válida." };
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // La actividad debe existir (antes cualquier id inventado daba cristales)
    const exists = await writeClient.fetch<boolean>(
      `count(*[_type == "activity" && _id == $activityId]) > 0`,
      { activityId },
    );
    if (!exists) return { error: "Actividad no encontrada." };

    const reflection = reflectionData
      ? {
          mood: String(reflectionData.mood ?? "").slice(0, 30),
          difficulty: Math.min(5, Math.max(1, Math.round(Number(reflectionData.difficulty) || 1))),
        }
      : null;

    await retryOnConflict(async () => {
      const kid = await writeClient.fetch<{ _rev: string; completedActivities?: string[] } | null>(
        `*[_type == "kidProfile" && _id == $kidId][0]{_rev, completedActivities}`,
        { kidId },
      );
      if (!kid) throw new Error("Perfil no encontrado");
      const firstTime = !(kid.completedActivities || []).includes(activityId);

      // IMPORTANTE: un patch por cada append. Dos .append() en el mismo patch
      // descartan el primero (se perdía completedActivities).
      const tx = writeClient.transaction();
      tx.patch(kidId, {
        ifRevisionID: kid._rev,
        setIfMissing: { completedActivities: [], activityLog: [] },
      });
      if (firstTime) {
        tx.patch(kidId, (p) =>
          p.append("completedActivities", [activityId]).inc({ energyCrystals: ACTIVITY_REWARD }),
        );
        if (reflection) {
          tx.patch(kidId, (p) =>
            p.append("activityLog", [
              {
                _key: randomUUID(),
                activityRef: { _type: "reference", _ref: activityId },
                completedAt: new Date().toISOString(),
                reflection,
              },
            ]),
          );
        }
      }
      // AUTO-CLEANUP: quitar de la bandeja de asignadas
      tx.patch(kidId, (p) => p.unset([`assignedActivities[_ref == "${activityId}"]`]));
      await tx.commit();
    });

    revalidatePath(currentPath);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/kid/${kidId}`);
    revalidatePath("/actividades");

    return { success: true };
  } catch (error) {
    console.error("Error guardando progreso de la actividad:", error);
    return { error: "Hubo un error al guardar tu progreso." };
  }
}
