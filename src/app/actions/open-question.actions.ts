"use server";

import { client } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitOpenAnswer(
  lessonId: string,
  responseText: string,
  reward: number,
  currentPath: string,
  blockKey: string,
) {
  try {
    const cookieStore = await cookies();
    const kidId = cookieStore.get("activeKidId")?.value;

    if (!kidId) return { error: "No hay cadete activo." };

    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{
        completedOpenQuestions, 
        energyCrystals,
        academicTelemetry
      }`,
      { kidId },
    );

    const completed = kid?.completedOpenQuestions || [];
    const currentCrystals = kid?.energyCrystals || 0;

    const currentTelemetry = kid?.academicTelemetry || [];
    const uniqueId = `${lessonId}-${blockKey}`;

    const telemetryRecord = {
      _type: "openQuestionRecord",
      _key:
        Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      lessonId: lessonId,
      blockKey,
      responseText: responseText,
      timestamp: new Date().toISOString(),
    };

    const updatedTelemetry = [...currentTelemetry, telemetryRecord];

    const patch = writeClient
      .patch(kidId)
      .set({ academicTelemetry: updatedTelemetry });

    if (!completed.includes(uniqueId)) {
      patch
        .setIfMissing({ completedOpenQuestions: [] })
        .append("completedOpenQuestions", [uniqueId])
        .set({ energyCrystals: currentCrystals + reward });
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
