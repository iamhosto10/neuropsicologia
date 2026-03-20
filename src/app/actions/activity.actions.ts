// src/app/actions/activity.actions.ts
"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function markActivityCompleted(
  kidId: string,
  activityId: string,
  currentPath: string,
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

    // 2. Si no la ha completado antes, la agregamos y damos la recompensa (ej. +20 Cristales)
    if (!completed.includes(activityId)) {
      patch
        .setIfMissing({ completedActivities: [] })
        .append("completedActivities", [activityId])
        .set({ energyCrystals: currentCrystals + 20 });
    }

    // 3. AUTO-CLEANUP: Quitamos la actividad de la bandeja de "Actividades Asignadas"
    patch.unset([`assignedActivities[_ref == "${activityId}"]`]);

    // 4. Guardamos los cambios
    await patch.commit();

    // 5. Freno anti-caché de Next.js
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 6. Invalidamos las rutas para que la UI se actualice instantáneamente
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
