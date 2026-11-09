// src/app/actions/mission.actions.ts
"use server";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";

import { client } from "@/sanity/lib/client";
import { retryOnConflict } from "@/lib/sanity-safe";
import { isValidDate, validateMissions } from "@/lib/game-rules";
import { getTodayDate } from "@/lib/utils";
import { computeReward } from "@/lib/reward-policy";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. EL MOTOR DE GUARDADO (inyecta el gameType en la telemetría)
// Seguro ante doble envío / peticiones simultáneas: escribe con ifRevisionID
// y reintenta releyendo, así la recompensa se da una sola vez.
export async function saveMissionProgress(
  kidId: string,
  missionKey: string, // _key de la misión dentro de la sesión
  _crystalsFromClient: number, // ignorado: el servidor calcula la recompensa
  telemetry: any[],
) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { success: false };
  if (typeof missionKey !== "string" || missionKey.length > 128) return { success: false };

  // La telemetría viene del navegador: se acota antes de guardarla
  const metrics = Array.isArray(telemetry) ? telemetry[0] : telemetry;
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) return { success: false };
  const metricsJson = JSON.stringify(metrics);
  if (metricsJson.length > 5000) return { success: false };

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    let gameType = "unknown";
    let found = true;

    await retryOnConflict(async () => {
      const session = await writeClient.fetch(
        `*[_type == "dailySession" && kidProfile._ref == $kidId && $missionKey in missions[]._key][0]{
          _id, _rev, missions, completedMissions
        }`,
        { kidId, missionKey },
      );
      if (!session) {
        found = false;
        return;
      }

      const currentMission = session.missions?.find((m: any) => m._key === missionKey);
      gameType = currentMission?.gameType || "unknown";
      const completedArray: string[] = session.completedMissions || [];
      if (completedArray.includes(missionKey)) return; // ya guardada: no duplicar

      // Cristales: política "base + bonus" calculada aquí con la telemetría (el valor del
      // navegador se ignora); nunca más de lo que da la misión.
      const maxReward = Number(currentMission?.energyReward) || 0;
      const reward = Math.min(computeReward(metrics, maxReward), maxReward);

      const newCompletedArray = [...completedArray, missionKey];
      const isFullyCompleted = newCompletedArray.length >= (session.missions?.length || 0);
      const telemetryRecord = JSON.stringify({
        missionId: missionKey,
        gameType,
        timestamp: new Date().toISOString(),
        metrics,
      });

      const tx = writeClient.transaction();
      // El patch de la sesión lleva ifRevisionID: si otra petición ganó, falla (409) y se reintenta
      tx.patch(session._id, {
        ifRevisionID: session._rev,
        setIfMissing: { telemetryData: [] },
      });
      tx.patch(session._id, (p) =>
        p
          .append("telemetryData", [telemetryRecord])
          .set({ completedMissions: newCompletedArray, isCompleted: isFullyCompleted }),
      );
      tx.patch(kidId, (p) => p.inc({ energyCrystals: reward }));
      await tx.commit();
    });

    if (!found) {
      console.error("❌ Sesión no encontrada para la llave:", missionKey);
      return { success: false };
    }

    console.log(`✅ Misión ${gameType} completada.`);
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
  const checked = validateMissions(gamesConfig);
  if (!checked.ok) return { error: checked.error };
  if (!isValidDate(date)) return { error: "Fecha no válida." };
  if (date < getTodayDate()) return { error: "No puedes programar misiones en una fecha pasada." };
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Misiones con _key nuevo (Sanity exige llaves únicas)
    const formattedMissions = checked.missions.map((m) => ({ _key: crypto.randomUUID(), ...m }));

    const existingSession = await writeClient.fetch(
      `*[_type == "dailySession" && kidProfile._ref == $kidId && date == $date][0]{_id}`,
      { kidId, date },
    );

    if (existingSession) {
      // Al sobrescribir las misiones se reinicia el progreso del día: las llaves viejas
      // contaban como "completadas" y el día podía marcarse terminado sin jugar.
      // La telemetría ya guardada se conserva (es historial clínico).
      await writeClient
        .patch(existingSession._id)
        .set({ missions: formattedMissions, completedMissions: [], isCompleted: false })
        .commit();
    } else {
      await writeClient.create({
        _type: "dailySession",
        kidProfile: { _type: "reference", _ref: kidId },
        date,
        missions: formattedMissions,
        completedMissions: [],
        isCompleted: false,
      });
    }
  } catch (error) {
    console.error("❌ Error asignando misiones:", error);
    return { error: "Hubo un error al asignar las misiones." };
  }

  revalidatePath("/hq");
  revalidatePath(`/dashboard/kid/${kidId}`);
  redirect(`/dashboard/kid/${kidId}`);
}

export async function deleteDailySession(sessionId: string, kidId: string) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // La sesión debe ser de este cadete
    const owner = await writeClient.fetch(
      `*[_type == "dailySession" && _id == $sessionId][0].kidProfile._ref`,
      { sessionId },
    );
    if (owner !== kidId) return { error: "No autorizado" };

    // 1. Eliminamos el documento completo de la base de datos
    await writeClient.delete(sessionId);
    console.log(`🗑️ Sesión ${sessionId} eliminada correctamente.`);


    // 3. Invalidamos las rutas para que la Agenda se actualice
    revalidatePath(`/dashboard/kid/${kidId}/assign`);
    revalidatePath("/hq");

    return { success: true };
  } catch (error) {
    console.error("❌ Error eliminando la sesión:", error);
    return { error: "No se pudo eliminar el plan de entrenamiento." };
  }
}
