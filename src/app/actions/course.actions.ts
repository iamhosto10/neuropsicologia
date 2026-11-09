// src/app/actions/course.actions.ts
"use server";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";
import { isSafeId, retryOnConflict } from "@/lib/sanity-safe";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

const LESSON_REWARD = 10;

export async function markLessonCompleted(
  kidId: string,
  lessonId: string,
  currentPath: string,
) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };
  if (!isSafeId(lessonId)) return { error: "Lección no válida." };
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // La lección debe existir (antes cualquier id inventado daba cristales)
    const exists = await writeClient.fetch<boolean>(
      `count(*[_type == "lesson" && _id == $lessonId]) > 0`,
      { lessonId },
    );
    if (!exists) return { error: "Lección no encontrada." };

    const courseOwner = await writeClient.fetch<{ _id: string } | null>(
      `*[_type == "course" && $lessonId in syllabus[].lessons[]._ref][0]{_id}`,
      { lessonId },
    );

    await retryOnConflict(async () => {
      const kid = await writeClient.fetch<{ _rev: string; completedLessons?: string[] } | null>(
        `*[_type == "kidProfile" && _id == $kidId][0]{_rev, completedLessons}`,
        { kidId },
      );
      if (!kid) throw new Error("Perfil no encontrado");
      const firstTime = !(kid.completedLessons || []).includes(lessonId);

      const tx = writeClient.transaction();
      tx.patch(kidId, { ifRevisionID: kid._rev, setIfMissing: { completedLessons: [] } });
      if (firstTime) {
        tx.patch(kidId, (p) =>
          p.append("completedLessons", [lessonId]).inc({ energyCrystals: LESSON_REWARD }),
        );
      }
      if (courseOwner?._id && isSafeId(courseOwner._id)) {
        tx.patch(kidId, (p) => p.unset([`assignedCourses[_ref == "${courseOwner._id}"]`]));
      }
      await tx.commit();
    });

    revalidatePath(currentPath);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/kid/${kidId}`);
    revalidatePath("/cursos");

    return { success: true };
  } catch (error) {
    console.error("Error guardando progreso del curso:", error);
    return { error: "Hubo un error al guardar tu progreso." };
  }
}
