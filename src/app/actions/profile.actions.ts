// src/app/actions/profile.actions.ts
"use server";
import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function selectKidProfile(kidId: string) {
  const cookieStore = await cookies();

  cookieStore.set("activeKidId", kidId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  redirect("/hq");
}

export async function getActiveKidId() {
  const cookieStore = await cookies();
  const kidId = cookieStore.get("activeKidId")?.value;
  return kidId || null;
}

export async function clearKidProfile() {
  const cookieStore = await cookies();
  cookieStore.delete("activeKidId");
  redirect("/select-profile");
}

export async function createKidProfile(formData: FormData) {
  const alias = formData.get("alias") as string;

  if (!alias || alias.trim() === "") {
    return { error: "El nombre del cadete es requerido." };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "No autorizado. Inicia sesión nuevamente." };
  }

  const parentSanityId = `user-${userId}`;

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    await writeClient.create({
      _type: "kidProfile",
      alias: alias.trim(),
      parent: {
        _type: "reference",
        _ref: parentSanityId,
      },
      energyCrystals: 0,
      avatarStatus: "locked",
    });
  } catch (error) {
    console.error("❌ Error creando el perfil:", error);
    return { error: "Hubo un error de conexión al crear el perfil." };
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));

  revalidatePath("/dashboard");
  revalidatePath("/select-profile");
  redirect("/dashboard");
}

export async function selectKidAndRedirect(
  kidId: string,
  destinationUrl: string,
) {
  const cookieStore = await cookies();

  // 1. Guardamos al niño activo en la galleta (cookie)
  cookieStore.set("activeKidId", kidId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  // 2. Lo teletransportamos al curso
  redirect(destinationUrl);
}

export async function deleteKidProfile(kidId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Eliminamos el documento de Sanity usando su ID
    await writeClient.delete(kidId);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Recargamos las páginas para que la tabla se actualice
    revalidatePath("/dashboard/pacientes");
    revalidatePath("/dashboard");
    revalidatePath("/select-profile");

    return { success: true };
  } catch (error) {
    console.error("❌ Error eliminando el perfil:", error);
    return { error: "Hubo un error al eliminar el cadete." };
  }
}

export async function updateKidProfile(kidId: string, formData: FormData) {
  const alias = formData.get("alias") as string;

  if (!alias || alias.trim() === "") {
    return { error: "El nombre del cadete es requerido." };
  }

  const { userId } = await auth();
  if (!userId) return { error: "No autorizado" };

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Actualizamos solo el campo 'alias'
    await writeClient.patch(kidId).set({ alias: alias.trim() }).commit();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/kid/${kidId}`);
  } catch (error) {
    console.error("❌ Error actualizando el perfil:", error);
    return { error: "Hubo un error al actualizar el cadete." };
  }

  redirect("/dashboard/pacientes");
}
