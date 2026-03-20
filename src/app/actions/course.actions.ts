// src/app/actions/course.actions.ts
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

    // 1. Buscamos los datos actuales del niño
    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{completedLessons, energyCrystals}`,
      { kidId },
    );
    const completed = kid?.completedLessons || [];
    const currentCrystals = kid?.energyCrystals || 0;

    const courseOwner = await writeClient.fetch(
      `*[_type == "course" && $lessonId in lessons[]._ref][0]{_id}`,
      { lessonId },
    );

    const patch = writeClient.patch(kidId);

    if (!completed.includes(lessonId)) {
      patch
        .setIfMissing({ completedLessons: [] })
        .append("completedLessons", [lessonId])
        .set({ energyCrystals: currentCrystals + 10 });
    }

    if (courseOwner && courseOwner._id) {
      patch.unset([`assignedCourses[_ref == "${courseOwner._id}"]`]);
    }
    await patch.commit();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    revalidatePath(currentPath);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/kid/${kidId}`);
    revalidatePath("/cursos"); // Para que desaparezca de la zona azul de asignados

    return { success: true };
  } catch (error) {
    console.error("Error guardando progreso del curso:", error);
    return { error: "Hubo un error al guardar tu progreso." };
  }
}
