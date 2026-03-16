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

    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{completedLessons}`,
      { kidId },
    );
    const completed = kid?.completedLessons || [];

    if (!completed.includes(lessonId)) {
      await writeClient
        .patch(kidId)
        .setIfMissing({ completedLessons: [] })
        .append("completedLessons", [lessonId])
        .commit();
    }
    revalidatePath(currentPath);
    return { success: true };
  } catch (error) {
    console.error("Error guardando progreso del curso:", error);
    return { error: "Hubo un error al guardar tu progreso." };
  }
}
