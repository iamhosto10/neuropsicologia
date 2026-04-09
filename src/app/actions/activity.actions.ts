// src/app/actions/activity.actions.ts
"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto"; // 🔥 Necesario para crear un _key único en Sanity

export async function markActivityCompleted(
  kidId: string,
  activityId: string,
  currentPath: string,
  // 🔥 Nuevo parámetro opcional para recibir la bitácora
  reflectionData?: { mood: string; difficulty: number },
) {
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // 1. Buscamos los datos actuales del niño
    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{completedActivities, energyCrystals}`,
      { kidId },
    );
    const completed = kid?.completedActivities || [];
    const currentCrystals = kid?.energyCrystals || 0;

    const patch = writeClient.patch(kidId);

    // 2. Si no la ha completado antes, damos recompensa y guardamos
    if (!completed.includes(activityId)) {
      // Mantenemos el array viejo (completedActivities) para que el candado visual siga funcionando rápido
      patch
        .setIfMissing({ completedActivities: [], activityLog: [] })
        .append("completedActivities", [activityId])
        .set({ energyCrystals: currentCrystals + 20 });

      // 🔥 SI VIENE REFLEXIÓN, LA AÑADIMOS A LA NUEVA BITÁCORA
      if (reflectionData) {
        const newLogEntry = {
          _key: randomUUID(), // Sanity exige esto en arrays de objetos
          activityRef: { _type: "reference", _ref: activityId },
          completedAt: new Date().toISOString(),
          reflection: {
            mood: reflectionData.mood,
            difficulty: reflectionData.difficulty,
          },
        };

        patch.append("activityLog", [newLogEntry]);
      }
    }

    // 3. AUTO-CLEANUP: Quitamos la actividad de la bandeja de asignadas
    patch.unset([`assignedActivities[_ref == "${activityId}"]`]);

    // 4. Guardamos los cambios
    await patch.commit();

    // 5. Freno anti-caché de Next.js
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 6. Invalidamos las rutas
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
