"use server";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function assignToKid(
  kidId: string,
  itemId: string,
  itemType: "course" | "activity",
) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    const fieldName =
      itemType === "course" ? "assignedCourses" : "assignedActivities";

    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{ ${fieldName} }`,
      { kidId },
    );
    const currentAssigned = kid?.[fieldName] || [];
    const isAlreadyAssigned = currentAssigned.some(
      (ref: any) => ref._ref === itemId,
    );

    if (!isAlreadyAssigned) {
      await writeClient
        .patch(kidId)
        .setIfMissing({ [fieldName]: [] })
        .append(fieldName, [
          {
            _key: crypto.randomUUID(),
            _type: "reference",
            _ref: itemId,
          },
        ])
        .commit();
    }


    revalidatePath(`/dashboard/cursos`);
    revalidatePath(`/cursos`);

    return { success: true };
  } catch (error) {
    console.error("Error al asignar:", error);
    return { error: "Hubo un problema al asignar el recurso." };
  }
}
