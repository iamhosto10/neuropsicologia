"use server";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function markLessonCompleted(
  kidId: string,
  lessonId: string,
  currentPath: string,
) {
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // 1. Buscamos al niño para ver sus lecciones previas y sus cristales actuales
    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{completedLessons, energyCrystals}`,
      { kidId },
    );
    const completed = kid?.completedLessons || [];
    const currentCrystals = kid?.energyCrystals || 0;

    // 2. Si no ha completado esta lección, la guardamos y le damos su recompensa
    if (!completed.includes(lessonId)) {
      await writeClient
        .patch(kidId)
        .setIfMissing({ completedLessons: [] })
        .append("completedLessons", [lessonId])
        .set({ energyCrystals: currentCrystals + 10 }) // 🔥 LA RECOMPENSA
        .commit();
    }

    // 3. Freno de mano para la consistencia eventual de Sanity
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. Limpiamos la caché de la lección actual y de los paneles de control
    revalidatePath(currentPath);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/kid/${kidId}`);

    return { success: true };
  } catch (error) {
    console.error("Error guardando progreso del curso:", error);
    return { error: "Hubo un error al guardar tu progreso." };
  }
}
