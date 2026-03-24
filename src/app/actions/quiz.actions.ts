"use server";

import { client } from "@/sanity/lib/client";
import { cookies } from "next/headers";
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
    const cookieStore = await cookies();
    const kidId = cookieStore.get("activeKidId")?.value;

    if (!kidId) return { error: "No hay cadete activo." };

    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{completedQuizzes, energyCrystals, academicTelemetry}`,
      { kidId },
    );

    const completed = kid?.completedQuizzes || [];
    const currentCrystals = kid?.energyCrystals || 0;
    const currentTelemetry = kid?.academicTelemetry || [];

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

    // 🔥 MÉTODO INFALIBLE: Unimos la telemetría vieja con la nueva en JavaScript
    const updatedTelemetry = [...currentTelemetry, telemetryRecord];

    // Iniciamos el parche sobrescribiendo la telemetría directamente
    const patch = writeClient
      .patch(kidId)
      .set({ academicTelemetry: updatedTelemetry });

    // Si es correcta y no estaba completada, unimos también el arreglo de completados
    if (isCorrect && !completed.includes(uniqueId)) {
      const updatedCompleted = [...completed, uniqueId];
      patch
        .set({ completedQuizzes: updatedCompleted })
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
