"use server";
import { getOwnedActiveKidId } from "@/lib/auth-guards";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function submitOpenAnswer(
  lessonId: string,
  responseText: string,
  reward: number,
  currentPath: string,
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
      `*[_type == "kidProfile" && _id == $kidId][0]{
        completedOpenQuestions
      }`,
      { kidId },
    );

    const completed = kid?.completedOpenQuestions || [];
    const uniqueId = `${lessonId}-${blockKey}`;

    const telemetryRecord = {
      _type: "openQuestionRecord",
      _key: crypto.randomUUID(),
      lessonId: lessonId,
      blockKey,
      responseText: responseText,
      timestamp: new Date().toISOString(),
    };

    // append/inc en vez de reescribir el arreglo: dos respuestas seguidas
    // ya no se pisan entre sí ni pierden cristales
    const patch = writeClient
      .patch(kidId)
      .setIfMissing({ academicTelemetry: [] })
      .append("academicTelemetry", [telemetryRecord]);

    if (!completed.includes(uniqueId)) {
      patch
        .setIfMissing({ completedOpenQuestions: [] })
        .append("completedOpenQuestions", [uniqueId])
        .inc({ energyCrystals: reward });
    }

    await patch.commit();

    revalidatePath(currentPath);
    revalidatePath("/hq");
    revalidatePath(`/dashboard/kid/${kidId}`);

    return { success: true };
  } catch (error) {
    console.error("Error en submitOpenAnswer:", error);
    return { error: "Hubo un error al enviar tu respuesta." };
  }
}
