"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

// 👇 Añadimos 'missionId' a los parámetros
export async function saveMissionProgress(
  kidId: string,
  missionId: string,
  crystalsEarned: number,
  telemetry: any[],
) {
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // 1. Buscamos cuál es la sesión de HOY para este niño
    const today = new Date().toISOString().split("T")[0];
    const sessionQuery = `*[_type == "dailySession" && references($kidId) && date == $today][0]`;
    const session = await writeClient.fetch(sessionQuery, { kidId, today });

    // 2. Iniciamos una Transacción múltiple
    const tx = writeClient.transaction();

    // Sumamos los cristales al niño
    tx.patch(kidId, (p) => p.inc({ energyCrystals: crystalsEarned }));

    // Si encontramos la sesión de hoy, la actualizamos
    if (session) {
      const completedArray = session.completedMissions || [];

      // Verificamos que no haya guardado esta misión ya (previene clics dobles)
      if (!completedArray.includes(missionId)) {
        const newCompletedArray = [...completedArray, missionId];
        // Si la cantidad de completadas es igual a las asignadas, cerramos el día
        const isFullyCompleted =
          newCompletedArray.length >= (session.missions?.length || 0);

        tx.patch(session._id, (p) =>
          p.set({
            completedMissions: newCompletedArray,
            isCompleted: isFullyCompleted,
          }),
        );
      }
    }

    // 3. Ejecutamos todos los cambios a la vez
    await tx.commit();

    console.log(`✅ Misión ${missionId} completada. Cristales sumados.`);
    revalidatePath("/hq");

    return { success: true };
  } catch (error) {
    console.error("❌ Error guardando progreso:", error);
    return { success: false };
  }
}
