"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 👇 Añadimos 'missionId' a los parámetros
export async function saveMissionProgress(
  kidId: string,
  missionId: string,
  crystalsEarned: number,
  telemetry: any[],
) {
  console.log("telemetria", telemetry);
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

        const telemetryRecord = JSON.stringify({
          missionId,
          timestamp: new Date().toISOString(),
          metrics: telemetry[0] || telemetry, // Tomamos los datos del juego
        });

        tx.patch(session._id, (p) =>
          p
            .setIfMissing({ telemetryData: [] })
            .append("telemetryData", [telemetryRecord])
            .set({
              completedMissions: newCompletedArray,
              isCompleted: isFullyCompleted,
            }),
        );
      }
    }

    // 3. Ejecutamos todos los cambios a la vez
    await tx.commit();

    await new Promise((resolve) => setTimeout(resolve, 600));

    console.log(`✅ Misión ${missionId} completada. Cristales sumados.`);
    revalidatePath("/hq");

    return { success: true };
  } catch (error) {
    console.error("❌ Error guardando progreso:", error);
    return { success: false };
  }
}

export async function assignDailySession(kidId: string, missionIds: string[]) {
  if (!missionIds || missionIds.length === 0) {
    return { error: "Debes seleccionar al menos una misión." };
  }

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    const today = new Date().toISOString().split("T")[0];

    await writeClient.create({
      _type: "dailySession",
      kidProfile: {
        _type: "reference",
        _ref: kidId,
      },
      date: today,
      missions: missionIds.map((id) => ({
        _key: Math.random().toString(36).substring(7),
        _type: "reference",
        _ref: id,
      })),
      completedMissions: [],
      isCompleted: false,
    });
  } catch (error) {
    console.error("❌ Error asignando misiones:", error);
    return { error: "Hubo un error al asignar las misiones." };
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  revalidatePath("/hq");
  revalidatePath(`/dashboard/kid/${kidId}`);

  redirect(`/dashboard/kid/${kidId}`);
}
