"use server";

import { client } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitQuizAnswer(
  lessonId: string,
  isCorrect: boolean,
  reward: number,
  currentPath: string,
  selected: number,
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
      `*[_type == "kidProfile" && _id == $kidId][0]{completedQuizzes, energyCrystals}`,
      { kidId },
    );

    const completed = kid?.completedQuizzes || [];
    const currentCrystals = kid?.energyCrystals || 0;

    const telemetryRecord = {
      _type: "quizRecord",
      _key: crypto.randomUUID(),
      lessonId,
      isCorrect,
      selected: selected + "",
      timestamp: new Date().toISOString(),
    };

    const patch = writeClient
      .patch(kidId)
      .setIfMissing({ academicTelemetry: [], completedQuizzes: [] })
      .append("academicTelemetry", [telemetryRecord]);

    if (isCorrect && !completed.includes(lessonId)) {
      patch
        .append("completedQuizzes", [lessonId])
        .set({ energyCrystals: currentCrystals + reward });
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
