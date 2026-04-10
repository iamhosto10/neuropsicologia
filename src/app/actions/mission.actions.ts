// src/app/actions/mission.actions.ts
"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. EL MOTOR DE GUARDADO (Ahora inyecta el gameType en la telemetría)
export async function saveMissionProgress(
  kidId: string,
  missionKey: string, // 🔥 Antes era missionId, ahora es el _key de la misión en la sesión
  crystalsEarned: number,
  telemetry: any[],
) {
  console.log("telemetria", telemetry);
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // 1. Buscamos la sesión que contenga ESE _key específico en sus misiones
    // Ya no dependemos de "date == today", lo buscamos por su ID único (_key)
    const sessionQuery = `*[_type == "dailySession" && references($kidId) && $missionKey in missions[]._key][0]{
      _id,
      missions,
      completedMissions
    }`;
    const session = await writeClient.fetch(sessionQuery, {
      kidId,
      missionKey,
    });

    if (!session) {
      console.error("❌ Sesión no encontrada para la llave:", missionKey);
      return { success: false };
    }

    // 2. Extraemos qué juego era para pegarlo como "etiqueta" en la telemetría
    const currentMission = session.missions?.find(
      (m: any) => m._key === missionKey,
    );
    const gameType = currentMission?.gameType || "unknown";

    // 3. Iniciamos la Transacción múltiple
    const tx = writeClient.transaction();

    // Sumamos los cristales al niño
    tx.patch(kidId, (p) => p.inc({ energyCrystals: crystalsEarned }));

    const completedArray = session.completedMissions || [];

    // Verificamos que no haya guardado esta misión ya (previene clics dobles)
    if (!completedArray.includes(missionKey)) {
      const newCompletedArray = [...completedArray, missionKey];
      const isFullyCompleted =
        newCompletedArray.length >= (session.missions?.length || 0);

      // 🔥 EL TRUCO MAESTRO: Metemos el gameType directo en el JSON
      const telemetryRecord = JSON.stringify({
        missionId: missionKey,
        gameType: gameType, // Esto le salva la vida al Dashboard
        timestamp: new Date().toISOString(),
        metrics: telemetry[0] || telemetry,
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

    await tx.commit();
    await new Promise((resolve) => setTimeout(resolve, 600));

    console.log(`✅ Misión ${gameType} completada. Cristales sumados.`);
    revalidatePath("/hq");

    return { success: true };
  } catch (error) {
    console.error("❌ Error guardando progreso:", error);
    return { success: false };
  }
}

// 2. EL MOTOR DE ASIGNACIÓN (Ahora recibe la Fecha y la Configuración al vuelo)
export async function assignDailySession(
  kidId: string,
  date: string,
  gamesConfig: any[],
) {
  if (!gamesConfig || gamesConfig.length === 0) {
    return { error: "Debes configurar al menos una misión." };
  }

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // 1. Armamos las misiones con los datos que mandó el terapeuta (sin crear documentos externos)
    const formattedMissions = gamesConfig.map((game) => ({
      _key: Math.random().toString(36).substring(7), // Sanity exige llaves únicas
      gameType: game.gameType,
      title: game.title,
      difficulty: game.difficulty || "medium",
      timeLimit: parseInt(game.timeLimit) || 60,
      energyReward: parseInt(game.energyReward) || 50,
    }));

    // 2. Buscamos si ya existe una sesión programada para ESA FECHA específica
    const existingSession = await writeClient.fetch(
      `*[_type == "dailySession" && kidProfile._ref == $kidId && date == $date][0]`,
      { kidId, date },
    );

    if (existingSession) {
      // 3A. Si ya existe, le sobrescribimos las misiones (Patch)
      await writeClient
        .patch(existingSession._id)
        .set({
          missions: formattedMissions,
          isCompleted: false,
        })
        .commit();
    } else {
      // 3B. Si no existe, le creamos una agenda nueva para ese día (Create)
      await writeClient.create({
        _type: "dailySession",
        kidProfile: { _type: "reference", _ref: kidId },
        date: date,
        missions: formattedMissions,
        completedMissions: [],
        isCompleted: false,
      });
    }
  } catch (error) {
    console.error("❌ Error asignando misiones:", error);
    return { error: "Hubo un error al asignar las misiones." };
  }

  // Freno anti-caché
  await new Promise((resolve) => setTimeout(resolve, 1500));

  revalidatePath("/hq");
  revalidatePath(`/dashboard/kid/${kidId}`);
  redirect(`/dashboard/kid/${kidId}`);
}

export async function deleteDailySession(sessionId: string, kidId: string) {
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // 1. Eliminamos el documento completo de la base de datos
    await writeClient.delete(sessionId);
    console.log(`🗑️ Sesión ${sessionId} eliminada correctamente.`);

    // 2. Freno anti-caché
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Invalidamos las rutas para que la Agenda se actualice
    revalidatePath(`/dashboard/kid/${kidId}/assign`);
    revalidatePath("/hq");

    return { success: true };
  } catch (error) {
    console.error("❌ Error eliminando la sesión:", error);
    return { error: "No se pudo eliminar el plan de entrenamiento." };
  }
}
