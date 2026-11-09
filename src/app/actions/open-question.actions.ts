"use server";
import { getOwnedActiveKidId } from "@/lib/auth-guards";
import { isSafeId, retryOnConflict } from "@/lib/sanity-safe";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

// OJO: `reward` del navegador se ignora; se usa el del bloque en Sanity.
export async function submitOpenAnswer(
  lessonId: string,
  responseText: string,
  _rewardFromClient: number,
  currentPath: string,
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

    const block = await writeClient.fetch<{ reward?: number } | null>(
      `*[_type == "lesson" && _id == $lessonId][0].content[_key == $blockKey && _type == "lessonOpenQuestion"][0]{reward}`,
      { lessonId, blockKey },
    );
    if (!block) return { error: "Pregunta no encontrada." };

    const reward = Math.min(Math.max(0, Number(block.reward) || 0), 100);
    const text = String(responseText ?? "").slice(0, 2000);
    const uniqueId = `${lessonId}-${blockKey}`;

    await retryOnConflict(async () => {
      const kid = await writeClient.fetch<{ _rev: string; completedOpenQuestions?: string[] } | null>(
        `*[_type == "kidProfile" && _id == $kidId][0]{_rev, completedOpenQuestions}`,
        { kidId },
      );
      if (!kid) throw new Error("Perfil no encontrado");
      const shouldReward = !(kid.completedOpenQuestions || []).includes(uniqueId);

      const telemetryRecord = {
        _type: "openQuestionRecord",
        _key: crypto.randomUUID(),
        lessonId,
        blockKey,
        responseText: text,
        timestamp: new Date().toISOString(),
      };

      // Un patch POR cada append (dos .append() en un patch pierden el primero).
      const tx = writeClient.transaction();
      if (shouldReward) {
        tx.patch(kidId, {
          ifRevisionID: kid._rev,
          setIfMissing: { completedOpenQuestions: [] },
        });
        tx.patch(kidId, (p) =>
          p.append("completedOpenQuestions", [uniqueId]).inc({ energyCrystals: reward }),
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

    return { success: true };
  } catch (error) {
    console.error("Error en submitOpenAnswer:", error);
    return { error: "Hubo un error al enviar tu respuesta." };
  }
}
