"use server";
import { getOwnedActiveKidId } from "@/lib/auth-guards";
import { isSafeId, retryOnConflict } from "@/lib/sanity-safe";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

// OJO: `isCorrect` y `reward` los manda el navegador y NO se usan: el servidor
// calcula ambos desde el bloque real de la lección en Sanity.
export async function submitQuizAnswer(
  lessonId: string,
  _isCorrectFromClient: boolean,
  _rewardFromClient: number,
  currentPath: string,
  selected: string,
  blockKey: string,
) {
  try {
    const kidId = await getOwnedActiveKidId();
    if (!kidId) return { error: "No hay cadete activo." };
    if (!isSafeId(lessonId) || typeof blockKey !== "string" || blockKey.length > 128) {
      return { error: "Pregunta no válida." };
    }

    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    const block = await writeClient.fetch<{
      options: string[];
      correctOptionIndex: number;
      reward?: number;
    } | null>(
      `*[_type == "lesson" && _id == $lessonId][0].content[_key == $blockKey && _type == "lessonQuestion"][0]{options, correctOptionIndex, reward}`,
      { lessonId, blockKey },
    );
    if (!block) return { error: "Pregunta no encontrada." };

    const selectedText = String(selected ?? "").slice(0, 500);
    const isCorrect = block.options?.[block.correctOptionIndex] === selectedText;
    const reward = Math.min(Math.max(0, Number(block.reward) || 0), 100);
    const uniqueId = `${lessonId}-${blockKey}`;

    await retryOnConflict(async () => {
      const kid = await writeClient.fetch<{ _rev: string; completedQuizzes?: string[] } | null>(
        `*[_type == "kidProfile" && _id == $kidId][0]{_rev, completedQuizzes}`,
        { kidId },
      );
      if (!kid) throw new Error("Perfil no encontrado");
      const shouldReward = isCorrect && !(kid.completedQuizzes || []).includes(uniqueId);

      const telemetryRecord = {
        _type: "quizRecord",
        _key: crypto.randomUUID(),
        lessonId,
        blockKey,
        isCorrect,
        selected: selectedText,
        timestamp: new Date().toISOString(),
      };

      // Un patch POR cada append: dos .append() en el mismo patch descartan el primero.
      const tx = writeClient.transaction();
      if (shouldReward) {
        tx.patch(kidId, {
          ifRevisionID: kid._rev,
          setIfMissing: { completedQuizzes: [] },
        });
        tx.patch(kidId, (p) =>
          p.append("completedQuizzes", [uniqueId]).inc({ energyCrystals: reward }),
        );
      } else {
        tx.patch(kidId, { ifRevisionID: kid._rev });
      }
      tx.patch(kidId, (p) =>
        p.setIfMissing({ academicTelemetry: [] }).append("academicTelemetry", [telemetryRecord]),
      );
      await tx.commit();
    });

    revalidatePath(currentPath);
    revalidatePath("/hq");
    revalidatePath(`/dashboard/kid/${kidId}`);

    return { success: true, isCorrect, reward: isCorrect ? reward : 0 };
  } catch (error) {
    console.error("Error en submitQuizAnswer:", error);
    return { error: "Hubo un error al procesar tu respuesta." };
  }
}
