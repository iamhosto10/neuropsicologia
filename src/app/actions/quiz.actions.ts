"use server";
import { getOwnedActiveKidId } from "@/lib/auth-guards";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function submitQuizAnswer(
  lessonId: string,
  isCorrect: boolean,
  reward: number,
  currentPath: string,
  selected: string,
  blockKey: string,
) {
  try {
    const kidId = await getOwnedActiveKidId();

    if (!kidId) return { error: "No hay cadete activo." };

    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{completedQuizzes}`,
      { kidId },
    );

    const completed = kid?.completedQuizzes || [];

    const uniqueId = `${lessonId}-${blockKey}`;

    const telemetryRecord = {
      _type: "quizRecord",
      _key: crypto.randomUUID(),
      lessonId,
      blockKey,
      isCorrect,
      selected,
      timestamp: new Date().toISOString(),
    };

    // append/inc en vez de reescribir el arreglo: dos respuestas seguidas
    // ya no se pisan entre sí ni pierden cristales
    const patch = writeClient
      .patch(kidId)
      .setIfMissing({ academicTelemetry: [] })
      .append("academicTelemetry", [telemetryRecord]);

    // Si es correcta y no estaba completada, unimos también el arreglo de completados
    if (isCorrect && !completed.includes(uniqueId)) {
      patch
        .setIfMissing({ completedQuizzes: [] })
        .append("completedQuizzes", [uniqueId])
        .inc({ energyCrystals: reward });
    }

    await patch.commit();

    revalidatePath(currentPath);
    revalidatePath("/hq");
    revalidatePath(`/dashboard/kid/${kidId}`);

    return { success: true };
  } catch (error) {
    console.error("Error en submitQuizAnswer:", error);
    return { error: "Hubo un error al procesar tu respuesta." };
  }
}
